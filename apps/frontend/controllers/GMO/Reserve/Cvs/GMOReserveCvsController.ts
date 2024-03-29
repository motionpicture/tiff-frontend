import ReserveBaseController from '../../../ReserveBaseController';
import Models from '../../../../../common/models/Models';
import ReservationUtil from '../../../../../common/models/Reservation/ReservationUtil';
import ReservationEmailCueUtil from '../../../../../common/models/ReservationEmailCue/ReservationEmailCueUtil';
import GMOResultModel from '../../../../models/Reserve/GMOResultModel';
import crypto = require('crypto');
import conf = require('config');

export default class GMOReserveCvsController extends ReserveBaseController {
    /**
     * GMOからの結果受信
     */
    public result(gmoResultModel: GMOResultModel): void {
        // 内容の整合性チェック
        this.logger.info('finding reservations...payment_no:', gmoResultModel.OrderID);
        Models.Reservation.find(
            {
                payment_no: gmoResultModel.OrderID
            },
            '_id purchaser_group pre_customer',
            (err, reservations) => {
                this.logger.info('reservations found.', err, reservations.length);
                if (err) return this.next(new Error(this.req.__('Message.UnexpectedError')));
                if (reservations.length === 0) return this.next(new Error(this.req.__('Message.UnexpectedError')));

                // チェック文字列
                // 8 ＋ 23 ＋ 24 ＋ 25 ＋ 39 + 14 ＋ショップパスワード
                let md5hash = crypto.createHash('md5');
                md5hash.update(`${gmoResultModel.OrderID}${gmoResultModel.CvsCode}${gmoResultModel.CvsConfNo}${gmoResultModel.CvsReceiptNo}${gmoResultModel.PaymentTerm}${gmoResultModel.TranDate}${conf.get<string>('gmo_payment_shop_password')}`, 'utf8');
                let checkString = md5hash.digest('hex');

                this.logger.info('CheckString must be ', checkString);
                if (checkString !== gmoResultModel.CheckString) {
                    return this.next(new Error(this.req.__('Message.UnexpectedError')));
                }

                // 決済待ちステータスへ変更
                this.logger.info('updating reservations by paymentNo...', gmoResultModel.OrderID);
                Models.Reservation.update(
                    {payment_no: gmoResultModel.OrderID},
                    {
                        gmo_shop_id: gmoResultModel.ShopID,
                        gmo_amount: gmoResultModel.Amount,
                        gmo_tax: gmoResultModel.Tax,
                        gmo_cvs_code: gmoResultModel.CvsCode,
                        gmo_cvs_conf_no: gmoResultModel.CvsConfNo,
                        gmo_cvs_receipt_no: gmoResultModel.CvsReceiptNo,
                        gmo_cvs_receipt_url: gmoResultModel.CvsReceiptUrl,
                        gmo_payment_term: gmoResultModel.PaymentTerm,
                        updated_user: 'GMOReserveCsvController'
                    },
                    {multi: true},
                    (err, raw) => {
                        this.logger.info('reservations updated.', err, raw);
                        if (err) return this.next(new Error(this.req.__('Message.ReservationNotCompleted')));

                        // 仮予約完了メールキュー追加(あれば更新日時を更新するだけ)
                        this.logger.info('creating reservationEmailCue...');
                        Models.ReservationEmailCue.findOneAndUpdate({
                            payment_no: gmoResultModel.OrderID,
                            template: ReservationEmailCueUtil.TEMPLATE_TEMPORARY,
                        }, {
                            $set: { updated_at: Date.now() },
                            $setOnInsert: { status: ReservationEmailCueUtil.STATUS_UNSENT }
                        }, {
                            upsert: true,
                            new: true
                        }, (err, cue) => {
                            this.logger.info('reservationEmailCue created.', err, cue);
                            if (err) {
                                // 失敗してもスルー(ログと運用でなんとかする)
                            }

                            this.logger.info('redirecting to waitingSettlement...');

                            // 購入者区分による振り分け
                            let group = reservations[0].get('purchaser_group');
                            switch (group) {
                                case ReservationUtil.PURCHASER_GROUP_MEMBER:
                                    this.res.redirect(this.router.build('member.reserve.waitingSettlement', {paymentNo: gmoResultModel.OrderID}));
                                    break;

                                default:
                                    if (reservations[0].get('pre_customer')) {
                                        this.res.redirect(this.router.build('pre.reserve.waitingSettlement', {paymentNo: gmoResultModel.OrderID}));
                                    } else {
                                        this.res.redirect(this.router.build('customer.reserve.waitingSettlement', {paymentNo: gmoResultModel.OrderID}));
                                    }

                                    break;
                            }
                        });
                    }
                );
            }
        );
    }
}
