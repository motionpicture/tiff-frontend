import ReserveBaseController from '../../ReserveBaseController';
import Util from '../../../../common/Util/Util';
import GMOUtil from '../../../../common/Util/GMO/GMOUtil';
import Models from '../../../../common/models/Models';
import ReservationUtil from '../../../../common/models/Reservation/ReservationUtil';
import ReservationModel from '../../../models/Reserve/ReservationModel';
import GMOResultModel from '../../../models/Reserve/GMOResultModel';
import moment = require('moment');
import conf = require('config');
import querystring = require('querystring');
import GMOReserveCreditController from './Credit/GMOReserveCreditController';
import GMOReserveCvsController from './Cvs/GMOReserveCvsController';

/**
 * マルチバイト文字列対応String.substr
 * 
 * @params {string} text
 * @params {number} length
 */
String.prototype['mbSubstr'] = function(from: number, length: number) {
    let letters = this.split('');
    let textLength = letters.length;
    let count = 0;
    let result = '';

    for (let i = 0; i < textLength; i++) {
        if (i + from > textLength - 1) break; 

        // マルチバイト文字列かどうか
        let letter = letters[i + from];
        count += (querystring.escape(letter).length < 4) ? 1 : 2;

        if (count > length) break;

        result += letter;
    }

    return result;
};

export default class GMOReserveController extends ReserveBaseController {
    /**
     * GMO決済を開始する
     */
    public start(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err) return this.next(new Error(this.req.__('Message.Expired')));

            // 予約情報セッション削除
            reservationModel.remove(() => {
                // 予約プロセス固有のログファイルをセット
                this.setProcessLogger(reservationModel.paymentNo, () => {
                    // GMOへ遷移画面

                    // 作品名から、特定文字以外を取り除く
                    let filmNameFullWidth = Util.toFullWidth(reservationModel.performance.film.name.ja);
                    let filmNameFullWidthLength = filmNameFullWidth.length;
                    let registerDisp1 = '';
                    for (let i = 0; i < filmNameFullWidthLength; i++) {
                        let letter = filmNameFullWidth[i];
                        if (
                            letter.match(/[Ａ-Ｚａ-ｚ０-９]/) // 全角英数字
                         || letter.match(/[\u3040-\u309F]/) // ひらがな
                         || letter.match(/[\u30A0-\u30FF]/) // カタカナ
                         || letter.match(/[一-龠]/) // 漢字
                        ) {
                            registerDisp1 += letter;
                        }
                    }

                    this.res.locals.registerDisp1 = registerDisp1['mbSubstr'](0, 32);
                    this.res.locals.registerDisp2 = Util.toFullWidth(`${reservationModel.performance.day.substr(0, 4)}／${reservationModel.performance.day.substr(4, 2)}／${reservationModel.performance.day.substr(6)}`);
                    this.res.locals.registerDisp3 = Util.toFullWidth(reservationModel.performance.theater.name.ja);
                    this.res.locals.registerDisp4 = Util.toFullWidth(`開場${reservationModel.performance.open_time.substr(0, 2)}:${reservationModel.performance.open_time.substr(2)}　開演${reservationModel.performance.start_time.substr(0, 2)}:${reservationModel.performance.start_time.substr(2)}`);

                    this.res.locals.shopId = conf.get<string>('gmo_payment_shop_id');
                    this.res.locals.orderID = reservationModel.paymentNo; // 27桁まで(購入番号を使用)
                    this.res.locals.amount = reservationModel.getTotalCharge().toString();
                    this.res.locals.dateTime =  moment(reservationModel.purchasedAt).format('YYYYMMDDHHmmss');
                    this.res.locals.useCredit = (reservationModel.paymentMethod === GMOUtil.PAY_TYPE_CREDIT) ? '1' : '0';
                    this.res.locals.useCvs = (reservationModel.paymentMethod === GMOUtil.PAY_TYPE_CVS) ? '1' : '0';
                    this.res.locals.shopPassString = GMOUtil.createShopPassString(
                        conf.get<string>('gmo_payment_shop_id'),
                        this.res.locals.orderID,
                        this.res.locals.amount,
                        conf.get<string>('gmo_payment_shop_password'),
                        this.res.locals.dateTime
                    );

                    if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'test') {
                        this.res.locals.retURL = `https://${conf.get<string>('dns_name_for_gmo_result')}${this.router.build('gmo.reserve.result')}?locale=${this.req.getLocale()}`;
                        // 決済キャンセル時に遷移する加盟店URL
                        this.res.locals.cancelURL = `https://${conf.get<string>('dns_name_for_gmo_result')}${this.router.build('gmo.reserve.cancel', {paymentNo: reservationModel.paymentNo})}?locale=${this.req.getLocale()}`;
                    } else {
                        this.res.locals.retURL = `https://${this.req.headers['host']}${this.router.build('gmo.reserve.result')}?locale=${this.req.getLocale()}`;
                        this.res.locals.cancelURL = `https://${this.req.headers['host']}${this.router.build('gmo.reserve.cancel', {paymentNo: reservationModel.paymentNo})}?locale=${this.req.getLocale()}`;
                    }

                    this.logger.info('redirecting to GMO payment...');
                    // GMOへの送信データをログに残すために、一度htmlを取得してからrender
                    this.res.render('gmo/reserve/start', (err, html) => {
                        this.logger.info('rendering gmo/reserve/start...html:', html);
                        this.res.render('gmo/reserve/start');
                    });
                });
            });
        });
    }

    /**
     * GMOからの結果受信
     * GMOで何かしらエラーが発生して「決済をやめる」ボタンから遷移してくることもある
     */
    public result(): void {
        let gmoResultModel = GMOResultModel.parse(this.req.body);
        let paymentNo = gmoResultModel.OrderID;

        // 予約プロセス固有のログファイルをセット
        this.setProcessLogger(paymentNo, () => {
            this.logger.info('gmoResultModel is', gmoResultModel);

            // エラー結果の場合
            if (gmoResultModel.ErrCode) {
                // 空席に戻す
                this.logger.info('finding reservations...payment_no:', paymentNo);
                Models.Reservation.find(
                    {
                        payment_no: paymentNo
                    },
                    'gmo_shop_pass_string purchased_at',
                    (err, reservations) => {
                        this.logger.info('reservations found.', err, reservations.length);
                        if (err) return this.next(new Error(this.req.__('Message.UnexpectedError')));
                        if (reservations.length === 0) return this.next(new Error(this.req.__('Message.NotFound')));

                        // 特に何もしない
                        this.res.render('gmo/reserve/cancel');
                    }
                );
            } else {
                // 決済方法によって振り分け
                switch (gmoResultModel.PayType) {
                    case GMOUtil.PAY_TYPE_CREDIT:
                        this.logger.info('starting GMOReserveCreditController.result...');
                        let creditController = new GMOReserveCreditController(this.req, this.res, this.next);
                        creditController.logger = this.logger;
                        creditController.result(gmoResultModel);
                        break;

                    case GMOUtil.PAY_TYPE_CVS:
                        this.logger.info('starting GMOReserveCsvController.result...');
                        let cvsController = new GMOReserveCvsController(this.req, this.res, this.next);
                        cvsController.logger = this.logger;
                        cvsController.result(gmoResultModel);
                        break;

                    default:
                        this.next(new Error(this.req.__('Message.UnexpectedError')));
                        break;
                }
            }
        });
    }

    /**
     * 決済キャンセル時に遷移
     */
    public cancel(): void {
        let paymentNo = this.req.params.paymentNo;
        if (!ReservationUtil.isValidPaymentNo(paymentNo)) return this.next(new Error(this.req.__('Message.Invalid')));

        this.setProcessLogger(paymentNo, () => {
            this.logger.info('start process GMOReserveController.cancel.');

            this.logger.info('finding reservations...');
            Models.Reservation.find(
                {
                    payment_no: paymentNo,
                    status: ReservationUtil.STATUS_WAITING_SETTLEMENT // GMO決済離脱組の処理なので、必ず決済中ステータスになっている
                },
                'purchaser_group'
            ).exec((err, reservations) => {
                this.logger.info('reservations found.', err, reservations);
                if (err) return this.next(new Error(this.req.__('Message.UnexpectedError')));
                if (reservations.length === 0) return this.next(new Error(this.req.__('Message.NotFound')));

                // 特に何もしない
                this.res.render('gmo/reserve/cancel');
            });
        });
    }
}
