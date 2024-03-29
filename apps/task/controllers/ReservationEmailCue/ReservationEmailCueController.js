"use strict";
const BaseController_1 = require('../BaseController');
const Util_1 = require('../../../common/Util/Util');
const Models_1 = require('../../../common/models/Models');
const ReservationUtil_1 = require('../../../common/models/Reservation/ReservationUtil');
const ReservationEmailCueUtil_1 = require('../../../common/models/ReservationEmailCue/ReservationEmailCueUtil');
const GMOUtil_1 = require('../../../common/Util/GMO/GMOUtil');
const moment = require('moment');
const conf = require('config');
const mongoose = require('mongoose');
const sendgrid = require('sendgrid');
const emailTemplates = require('email-templates');
const qr = require('qr-image');
const fs = require('fs-extra');
const numeral = require('numeral');
let MONGOLAB_URI = conf.get('mongolab_uri');
class ReservationEmailCueController extends BaseController_1.default {
    /**
     * キューを監視させる
     */
    watch() {
        mongoose.connect(MONGOLAB_URI);
        let count = 0;
        setInterval(() => {
            if (count > 10)
                return;
            count++;
            this.sendOne(() => {
                count--;
            });
        }, 500);
    }
    /**
     * 予約完了メールを送信する
     */
    sendOne(cb) {
        this.logger.info('finding reservationEmailCue...');
        Models_1.default.ReservationEmailCue.findOneAndUpdate({
            status: ReservationEmailCueUtil_1.default.STATUS_UNSENT
        }, {
            status: ReservationEmailCueUtil_1.default.STATUS_SENDING
        }, { new: true }, (err, cue) => {
            this.logger.info('reservationEmailCue found.', err, cue);
            if (err)
                return this.next(err, cue, this.logger, cb);
            if (!cue)
                return this.next(null, cue, this.logger, cb);
            // 予約ロガーを取得
            Util_1.default.getReservationLogger(cue.get('payment_no'), (err, _logger) => {
                if (err)
                    return this.next(err, cue, this.logger, cb);
                Models_1.default.Reservation.find({
                    payment_no: cue.get('payment_no')
                }, (err, reservations) => {
                    _logger.info('reservations for email found.', err, reservations.length);
                    if (err)
                        return this.next(err, cue, _logger, cb);
                    if (reservations.length === 0)
                        return this.next(null, cue, _logger, cb);
                    let to = '';
                    switch (reservations[0].get('purchaser_group')) {
                        case ReservationUtil_1.default.PURCHASER_GROUP_STAFF:
                            to = reservations[0].get('staff_email');
                            break;
                        default:
                            to = reservations[0].get('purchaser_email');
                            break;
                    }
                    _logger.info('to is', to);
                    if (!to)
                        return this.next(null, cue, _logger, cb);
                    let EmailTemplate = emailTemplates.EmailTemplate;
                    // __dirnameを使うとテンプレートを取得できないので注意
                    // http://stackoverflow.com/questions/38173996/azure-and-node-js-dirname
                    let dir;
                    let title_ja;
                    let title_en;
                    switch (cue.get('template')) {
                        case ReservationEmailCueUtil_1.default.TEMPLATE_COMPLETE:
                            // 1.5次販売はメールテンプレート別
                            if (reservations[0].get('pre_customer')) {
                                dir = `${process.cwd()}/apps/task/views/email/reserve/complete4preCustomer`;
                                title_ja = '東京国際映画祭チケット 購入完了のお知らせ';
                                title_en = 'Notice of Completion of TIFF Ticket Purchase';
                            }
                            else {
                                dir = `${process.cwd()}/apps/task/views/email/reserve/complete`;
                                title_ja = '東京国際映画祭チケット 購入完了のお知らせ';
                                title_en = 'Notice of Completion of TIFF Ticket Purchase';
                            }
                            break;
                        case ReservationEmailCueUtil_1.default.TEMPLATE_TEMPORARY:
                            // 1.5次販売はメールテンプレート別
                            if (reservations[0].get('pre_customer')) {
                                dir = `${process.cwd()}/apps/task/views/email/reserve/waitingSettlement4preCustomer`;
                                title_ja = '東京国際映画祭チケット 仮予約完了のお知らせ';
                                title_en = 'Notice of Completion of Tentative Reservation for TIFF Tickets';
                            }
                            else {
                                dir = `${process.cwd()}/apps/task/views/email/reserve/waitingSettlement`;
                                title_ja = '東京国際映画祭チケット 仮予約完了のお知らせ';
                                title_en = 'Notice of Completion of Tentative Reservation for TIFF Tickets';
                            }
                            break;
                        default:
                            break;
                    }
                    let template = new EmailTemplate(dir);
                    let locals = {
                        title_ja: title_ja,
                        title_en: title_en,
                        reservations: reservations,
                        moment: moment,
                        numeral: numeral,
                        conf: conf,
                        GMOUtil: GMOUtil_1.default,
                        ReservationUtil: ReservationUtil_1.default
                    };
                    _logger.info('rendering template...dir:', dir);
                    template.render(locals, (err, result) => {
                        _logger.info('email template rendered.', err);
                        if (err)
                            return this.next(new Error('failed in rendering an email.'), cue, _logger, cb);
                        let _sendgrid = sendgrid(conf.get('sendgrid_username'), conf.get('sendgrid_password'));
                        let email = new _sendgrid.Email({
                            to: to,
                            fromname: conf.get('email.fromname'),
                            from: conf.get('email.from'),
                            subject: `[QRコード付き]${title_ja} [QR CODE TICKET]${title_en}`,
                            html: result.html
                        });
                        // 完了の場合、QRコードを添付
                        if (cue.get('template') === ReservationEmailCueUtil_1.default.TEMPLATE_COMPLETE) {
                            // add barcodes
                            for (let reservation of reservations) {
                                let reservationId = reservation.get('_id').toString();
                                email.addFile({
                                    filename: `QR_${reservationId}.png`,
                                    contentType: 'image/png',
                                    cid: `qrcode_${reservationId}`,
                                    content: qr.imageSync(reservation.get('qr_str'), { type: 'png' })
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
                        _logger.info('sending an email...email:', email);
                        _sendgrid.send(email, (err, json) => {
                            _logger.info('an email sent.', err, json);
                            this.next(err, cue, _logger, cb);
                        });
                    });
                });
            });
        });
    }
    /**
     * メール送信トライ後の処理
     *
     * @param {Error} err
     * @param {mongoose.Document} cue
     * @param {log4js.Logger} logger
     * @param {Function} cb
     */
    next(err, cue, logger, cb) {
        if (!cue)
            return cb();
        let status = (err) ? ReservationEmailCueUtil_1.default.STATUS_UNSENT : ReservationEmailCueUtil_1.default.STATUS_SENT;
        // 送信済みフラグを立てる
        logger.info('setting status...', status);
        cue.set('status', status);
        cue.save((err, res) => {
            logger.info('cue saved.', err, res);
            cb();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReservationEmailCueController;
