import BaseController from '../BaseController';
import Models from '../../../common/models/Models';
import mongodb = require('mongodb');
import mongoose = require('mongoose');
import conf = require('config');
import ReservationUtil from '../../../common/models/Reservation/ReservationUtil';
import GMOUtil from '../../../common/Util/GMO/GMOUtil';
import Util from '../../../common/Util/Util';
import fs = require('fs-extra');
import request = require('request');
import querystring = require('querystring');
import moment = require('moment');
import sendgrid = require('sendgrid');
import emailTemplates = require('email-templates');
import qr = require('qr-image');
import numeral = require('numeral');
import GMONotificationModel from '../../../frontend/models/Reserve/GMONotificationModel';
import GMONotificationResponseModel from '../../../frontend/models/Reserve/GMONotificationResponseModel';

let MONGOLAB_URI = conf.get<string>('mongolab_uri');
let MONGOLAB_URI_FOR_GMO = conf.get<string>('mongolab_uri_for_gmo');

export default class GMOController extends BaseController {
    /**
     * GMO結果通知を処理する
     */
    public processNotification(): void {
        let db4gmo = mongoose.createConnection(MONGOLAB_URI_FOR_GMO);
        this.logger.info('finding notification...');
        db4gmo.collection('gmo_notifications').findOne({
            processed: false
        }, (err, notification) => {
            this.logger.info('notification found.', err, notification);
            if (err) {
                db4gmo.close();
                return process.exit(0);
            }
            if (!notification) {
                db4gmo.close();
                return process.exit(0);
            }
            if (!notification.order_id) {
                db4gmo.close();
                return process.exit(0);
            }

            db4gmo.close();




            mongoose.connect(MONGOLAB_URI, {});
            // 内容の整合性チェック
            this.logger.info('finding reservations...payment_no:', notification.order_id);
            Models.Reservation.find({
                payment_no: notification.order_id
            }, (err, reservations) => {
                this.logger.info('reservations found.', err, reservations.length);
                if (err) {
                    mongoose.disconnect();
                    return process.exit(0);
                }
                if (reservations.length === 0) {
                    mongoose.disconnect();
                    return process.exit(0);
                }

                // チェック文字列
                let shopPassString = GMOUtil.createShopPassString(
                    notification.shop_id,
                    notification.order_id,
                    notification.amount,
                    conf.get<string>('gmo_payment_shop_password'),
                    moment(reservations[0].get('purchased_at')).format('YYYYMMDDHHmmss')
                );
                this.logger.info('shopPassString must be ', reservations[0].get('gmo_shop_pass_string'));
                if (shopPassString !== reservations[0].get('gmo_shop_pass_string')) {
                    mongoose.disconnect();
                    return process.exit(0);
                }




                // クレジットカード決済の場合
                if (notification.pay_type === GMOUtil.PAY_TYPE_CREDIT) {
                    switch (notification.status) {
                        case GMOUtil.STATUS_CREDIT_CAPTURE:
                            // 予約完了ステータスへ変更
                            this.logger.info('updating reservations by paymentNo...', notification.order_id);
                            Models.Reservation.update(
                                {payment_no: notification.order_id},
                                {
                                    status: ReservationUtil.STATUS_RESERVED,
                                    updated_user: 'system'
                                },
                                {multi: true},
                                (err, raw) => {
                                    this.logger.info('reservations updated.', err, raw);
                                    if (err) {
                                        mongoose.disconnect();
                                        return process.exit(0);
                                    }

                                    this.logger.info('sending an email...');
                                    this.sendEmail(reservations, (err) => {
                                        this.logger.info('an email sent.', err);
                                        if (err) {
                                            mongoose.disconnect();
                                            return process.exit(0);
                                        } else {
                                            // processedフラグをたてる
                                            this.logger.info('saving notificaton...');
                                            db4gmo = mongoose.createConnection(MONGOLAB_URI_FOR_GMO);
                                            notification.processed = true;
                                            db4gmo.collection('gmo_notifications').updateOne({
                                                _id: notification._id
                                            }, notification, (err) => {
                                                this.logger.info('notification saved.', err);
                                                db4gmo.close();
                                                mongoose.disconnect();
                                                return process.exit(0);
                                            });
                                        }
                                    });
                                }
                            );

                            break;

                        case GMOUtil.STATUS_CREDIT_UNPROCESSED:
                            // 未決済の場合、放置
                            // ユーザーが「戻る」フローでキャンセルされる、あるいは、時間経過で空席になる
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CREDIT_AUTHENTICATED:
                        case GMOUtil.STATUS_CREDIT_CHECK:
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CREDIT_AUTH:
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CREDIT_SALES:
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CREDIT_VOID: // 取消し
                            // 空席に戻さない(つくったけれども、連動しない方向で仕様決定)
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CREDIT_RETURN:
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CREDIT_RETURNX:
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CREDIT_SAUTH:
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        default:
                            mongoose.disconnect();
                            process.exit(0);
                            break;
                    }
                } else if (notification.pay_type === GMOUtil.PAY_TYPE_CVS) {


                    switch (notification.status) {
                        case GMOUtil.STATUS_CVS_PAYSUCCESS:
                            // 予約完了ステータスへ変更
                            this.logger.info('updating reservations by paymentNo...', notification.order_id);
                            Models.Reservation.update(
                                {payment_no: notification.order_id},
                                {
                                    status: ReservationUtil.STATUS_RESERVED,
                                    updated_user: 'system'
                                },
                                {multi: true},
                                (err, raw) => {
                                    this.logger.info('reservations updated.', err, raw);
                                    if (err) {
                                        mongoose.disconnect();
                                        return process.exit(0);
                                    }

                                    this.logger.info('sending an email...');
                                    this.sendEmail(reservations, (err) => {
                                        this.logger.info('an email sent.', err);
                                        if (err) {
                                            mongoose.disconnect();
                                            return process.exit(0);
                                        } else {
                                            // processedフラグをたてる
                                            this.logger.info('saving notificaton...');
                                            db4gmo = mongoose.createConnection(MONGOLAB_URI_FOR_GMO);
                                            notification.processed = true;
                                            db4gmo.collection('gmo_notifications').updateOne({
                                                _id: notification._id
                                            }, notification, (err) => {
                                                this.logger.info('notification saved.', err);
                                                db4gmo.close();
                                                mongoose.disconnect();
                                                return process.exit(0);
                                            });
                                        }
                                    });
                                }
                            );

                            break;

                        case GMOUtil.STATUS_CVS_REQSUCCESS:
                            // メールだけ送信
                            this.logger.info('sending an email...');
                            this.sendEmail(reservations, (err) => {
                                this.logger.info('an email sent.', err);
                                if (err) {
                                    mongoose.disconnect();
                                    return process.exit(0);
                                } else {
                                    // processedフラグをたてる
                                    this.logger.info('saving notificaton...');
                                    db4gmo = mongoose.createConnection(MONGOLAB_URI_FOR_GMO);
                                    notification.processed = true;
                                    db4gmo.collection('gmo_notifications').updateOne({
                                        _id: notification._id
                                    }, notification, (err) => {
                                        this.logger.info('notification saved.', err);
                                        db4gmo.close();
                                        mongoose.disconnect();
                                        return process.exit(0);
                                    });
                                }
                            });

                            break;

                        case GMOUtil.STATUS_CVS_UNPROCESSED:
                            mongoose.disconnect();
                            process.exit(0);
                            break;

                        case GMOUtil.STATUS_CVS_PAYFAIL: // 決済失敗
                        case GMOUtil.STATUS_CVS_EXPIRED: // 期限切れ
                        case GMOUtil.STATUS_CVS_CANCEL: // 支払い停止
                            // 空席に戻す
                            this.logger.info('removing reservations...payment_no:', notification.order_id);
                            let promises = reservations.map((reservation) => {
                                return new Promise((resolve, reject) => {
                                    this.logger.info('removing reservation...', reservation.get('_id'));
                                    reservation.remove((err) => {
                                        this.logger.info('reservation removed.', reservation.get('_id'), err);
                                        (err) ? reject(err) : resolve();
                                    });
                                });
                            });
                            Promise.all(promises).then(() => {
                                // processedフラグをたてる
                                this.logger.info('saving notificaton...');
                                db4gmo = mongoose.createConnection(MONGOLAB_URI_FOR_GMO);
                                notification.processed = true;
                                db4gmo.collection('gmo_notifications').updateOne({
                                    _id: notification._id
                                }, notification, (err) => {
                                    this.logger.info('notification saved.', err);
                                    db4gmo.close();
                                    mongoose.disconnect();
                                    return process.exit(0);
                                });
                            }, (err) => {
                                mongoose.disconnect();
                                return process.exit(0);
                            });

                            break;

                        default:
                            mongoose.disconnect();
                            process.exit(0);
                            break;
                    }

                } else {
                    // 他の決済は本案件では非対応
                    mongoose.disconnect();
                    process.exit(0);
                }

            });

        });
    }

    /**
     * メール送信
     */
    private sendEmail(reservations: Array<mongoose.Document>, cb: (err: Error) => void): void {
        let to = '';
        let purchaserGroup = reservations[0].get('purchaser_group');
        switch (purchaserGroup) {
            case ReservationUtil.PURCHASER_GROUP_CUSTOMER:
            case ReservationUtil.PURCHASER_GROUP_MEMBER:
            case ReservationUtil.PURCHASER_GROUP_SPONSOR:
                to = reservations[0].get('purchaser_email')
                break;

            case ReservationUtil.PURCHASER_GROUP_STAFF:
                to = reservations[0].get('staff_email')
                break;

            default:
                break;
        }

        this.logger.info('to is', to);

        if (!to) return cb(null); // toがなければ終了




        let EmailTemplate = emailTemplates.EmailTemplate
        // __dirnameを使うとテンプレートを取得できないので注意
        // http://stackoverflow.com/questions/38173996/azure-and-node-js-dirname
        let dir: string;
        let title_ja: string;
        let title_en: string;
        switch (reservations[0].get('status')) {
            case ReservationUtil.STATUS_RESERVED:
                // 1.5次販売はメールテンプレート別
                if (reservations[0].get('pre_customer')) {
                    dir = `${process.cwd()}/apps/task/views/email/reserve/complete4preCustomer`;
                    title_ja = '東京国際映画祭チケット 購入完了のお知らせ';
                    title_en = 'Notice of Completion of TIFF Ticket Purchase';
                } else {
                    dir = `${process.cwd()}/apps/task/views/email/reserve/complete`;
                    title_ja = '東京国際映画祭チケット 購入完了のお知らせ';
                    title_en = 'Notice of Completion of TIFF Ticket Purchase';
                }

                break;
            case ReservationUtil.STATUS_WAITING_SETTLEMENT:
                // 1.5次販売はメールテンプレート別
                if (reservations[0].get('pre_customer')) {
                    dir = `${process.cwd()}/apps/task/views/email/reserve/waitingSettlement4preCustomer`;
                    title_ja = '東京国際映画祭チケット 仮予約完了のお知らせ';
                    title_en = 'Notice of Completion of Tentative Reservation for TIFF Tickets';
                } else {
                    dir = `${process.cwd()}/apps/task/views/email/reserve/waitingSettlement`;
                    title_ja = '東京国際映画祭チケット 仮予約完了のお知らせ';
                    title_en = 'Notice of Completion of Tentative Reservation for TIFF Tickets';
                }

                break;
            default:
                break;
        }

        if (!dir) return cb(null);

        let template = new EmailTemplate(dir);
        let locals = {
            title_ja: title_ja,
            title_en: title_en,
            reservations: reservations,
            moment: moment,
            numeral: numeral,
            conf: conf,
            GMOUtil: GMOUtil,
            ReservationUtil: ReservationUtil
        };
        this.logger.info('rendering template...dir:', dir);
        template.render(locals, (err, result) => {
            this.logger.info('email template rendered.', err);
            if (err) return cb(new Error('failed inf rendering an email.'));

            let _sendgrid = sendgrid(conf.get<string>('sendgrid_username'), conf.get<string>('sendgrid_password'));
            let email = new _sendgrid.Email({
                to: to,
                fromname: conf.get<string>('email.fromname'),
                from: conf.get<string>('email.from'),
                subject: `${(process.env.NODE_ENV !== 'prod') ? `[${process.env.NODE_ENV}]` : ''}${title_ja} ${title_en}`,
                html: result.html
            });

            // 完了の場合、QRコードを添付
            if (reservations[0].get('status') === ReservationUtil.STATUS_RESERVED) {
                // add barcodes
                for (let reservation of reservations) {
                    let reservationId = reservation.get('_id').toString();
                    let png = qr.imageSync(reservation.get('qr_str'), {type: 'png'});

                    email.addFile({
                        filename: `QR_${reservationId}.png`,
                        contentType: 'image/png',
                        cid: `qrcode_${reservationId}`,
                        content: png
                    });
                }
            }

            // add logo
            email.addFile({
                filename: `logo.png`,
                contentType: 'image/png',
                cid: 'logo',
                content: fs.readFileSync(`${__dirname}/../../../../public/images/email/logo.png`)
            });

            this.logger.info('sending an email...email:', email);
            _sendgrid.send(email, (err, json) => {
                this.logger.info('an email sent.', err, json);
                if (err) return cb(err);

                // 送信済みフラグを立てる
                this.logger.info('setting is_sent to true...');
                return cb(null);
            });
        });
    }
}