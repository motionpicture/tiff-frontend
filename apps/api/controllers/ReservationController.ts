import {BaseController} from './BaseController';
import {Request, Response, NextFunction} from "express";
import {JsonController, Req, Res, Post, Get, Param} from "routing-controllers";
import Util from '../../common/Util/Util';
import Models from '../../common/models/Models';
import ReservationUtil from '../../common/models/Reservation/ReservationUtil';
import Sendgrid = require('sendgrid');
import Conf = require('config');
import Validator = require('validator');
import Qr = require('qr-image');
import Moment = require('moment');
import Fs = require('fs-extra');

@JsonController()
export class ReservationController extends BaseController {
    /**
     * 予約情報メールを送信する
     */
    @Post("/api/:locale/reservation/email")
    email(@Req() request: Request, @Res() response: Response, @Param("locale") locale: string) {
        return new Promise((resolve, reject) => {
            request.setLocale('locale');

            let id = request.body.id;
            let to = request.body.to;
            // メールアドレスの有効性チェック
            let validator: typeof Validator = require('validator');
            if (!validator.isEmail(to)) {
                return reject(new Error(request.__('Message.invalid{{fieldName}}', {fieldName: request.__('Form.FieldName.email')})));
            }

            Models.Reservation.findOne(
                {
                    _id: id,
                    status: ReservationUtil.STATUS_RESERVED
                },
                (err, reservation) => {
                    if (err) return reject(new Error(request.__('Message.UnexpectedError')));
                    if (!reservation) return reject(new Error(request.__('Message.NotFound')));

                    let qr: typeof Qr = require('qr-image');
                    let qrcodeBuffer = qr.imageSync(reservation.get('qr_str'), {type: 'png'});
                    let title_ja = `${reservation.get('purchaser_name_ja')}様より東京国際映画祭のチケットが届いております`;
                    let title_en = `This is a notification that you have been invited to Tokyo International Film Festival by Mr./Ms. ${reservation.get('purchaser_name_en')}.`;

                    let moment: typeof Moment = require('moment');
                    let conf: typeof Conf = require('config');
                    response.render('email/resevation', {
                        layout: false,
                        reservations: [reservation],
                        to: to,
                        qrcode: qrcodeBuffer,
                        moment: moment,
                        conf: conf,
                        title_ja: title_ja,
                        title_en: title_en,
                        ReservationUtil: ReservationUtil
                    }, (err, html) => {
                        if (err) return reject(new Error(request.__('Message.UnexpectedError')));

                        let sendgrid: typeof Sendgrid = require('sendgrid');
                        let _sendgrid = sendgrid(conf.get<string>('sendgrid_username'), conf.get<string>('sendgrid_password'));
                        let email = new _sendgrid.Email({
                            to: to,
                            fromname: conf.get<string>('email.fromname'),
                            from: conf.get<string>('email.from'),
                            subject: `${title_ja} ${title_en}`,
                            html: html
                        });

                        let reservationId = reservation.get('_id').toString();

                        email.addFile({
                            filename: `QR_${reservationId}.png`,
                            contentType: 'image/png',
                            cid: `qrcode_${reservationId}`,
                            content: qrcodeBuffer
                        });

                        // logo
                        let fs: typeof Fs = require('fs-extra');
                        email.addFile({
                            filename: `logo.png`,
                            contentType: 'image/png',
                            cid: 'logo',
                            content: fs.readFileSync(`${__dirname}/../../../public/images/email/logo.png`)
                        });

                        this.logger.info('sending an email...email:', email);
                        _sendgrid.send(email, (err, json) => {
                            this.logger.info('an email sent.', err, json);
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                }
            );
        }).then(() => {
            return {
                success: true,
                message: null
            }
        }, (err) => {
            return {
                success: false,
                message: err.message
            }
        });
    }

    /**
     * 入場グラグをたてる
     */
    @Post("/api/reservation/:id/enter")
    enter(@Req() request: Request, @Param("id") id: string) {
        return new Promise((resolve, reject) => {
            Models.Reservation.update({_id: id}, {
                entered: true,
                entered_at: request.body.entered_at
            }, (err, raw) => {
                (err) ? reject(err) : resolve(raw);
            });
        }).then((raw) => {
            return {
                success: true
            };
        }, (err) => {
            return {
                success: false,
                message: err.message
            };
        });
    }

    @Get("/api/reservations")
    findByMvtkUser() {
        return new Promise((resolve, reject) => {
            // ひとまずデモ段階では、一般予約を10件返す
            Models.Reservation.find({
                purchaser_group: ReservationUtil.PURCHASER_GROUP_CUSTOMER,
                status: ReservationUtil.STATUS_RESERVED
            }).limit(10).lean(true).exec((err, reservations) => {
                (err) ? reject(err) : resolve(reservations);
            });
        }).then((reservations) => {
            return {
                success: true,
                reservations: reservations,
                message: null
            };
        }, (err) => {
            return {
                success: false,
                reservations: [],
                message: err.message
            };
        });
    }

    @Get("/api/reservation/:id")
    findById(@Param("id") id: string) {
        return new Promise((resolve, reject) => {
            Models.Reservation.findOne({
                _id: id,
                status: ReservationUtil.STATUS_RESERVED
            }).lean(true).exec((err, reservation) => {
                (err) ? reject(err) : resolve(reservation);
            });
        }).then((reservation) => {
            return {
                success: true,
                reservation: reservation,
                message: null
            };
        }, (err) => {
            return {
                success: false,
                reservation: null,
                message: err.message
            };
        });
    }
}
