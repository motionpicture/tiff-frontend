"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const BaseController_1 = require('./BaseController');
const routing_controllers_1 = require("routing-controllers");
const MongooseModels_1 = require('../../common/models/MongooseModels');
const ReservationUtil_1 = require('../../common/models/Reservation/ReservationUtil');
const passport = require('passport');
let ReservationController = class ReservationController extends BaseController_1.BaseController {
    /**
     * 予約情報メールを送信する
     */
    email(request, response, locale) {
        return new Promise((resolve, reject) => {
            request.setLocale('locale');
            let id = request.body.id;
            let to = request.body.to;
            // メールアドレスの有効性チェック
            let validator = require('validator');
            if (!validator.isEmail(to)) {
                return reject(new Error(request.__('Message.invalid{{fieldName}}', { fieldName: request.__('Form.FieldName.email') })));
            }
            MongooseModels_1.ReservationModel.findOne({
                _id: id,
                status: ReservationUtil_1.default.STATUS_RESERVED
            }, (err, reservation) => {
                if (err)
                    return reject(new Error(request.__('Message.UnexpectedError')));
                if (!reservation)
                    return reject(new Error(request.__('Message.NotFound')));
                let qr = require('qr-image');
                let qrcodeBuffer = qr.imageSync(reservation.get('qr_str'), { type: 'png' });
                let title_ja = `${reservation.get('purchaser_name_ja')}様より東京国際映画祭のチケットが届いております`;
                let title_en = `This is a notification that you have been invited to Tokyo International Film Festival by Mr./Ms. ${reservation.get('purchaser_name_en')}.`;
                let moment = require('moment');
                let conf = require('config');
                response.render('email/resevation', {
                    layout: false,
                    reservations: [reservation],
                    to: to,
                    qrcode: qrcodeBuffer,
                    moment: moment,
                    conf: conf,
                    title_ja: title_ja,
                    title_en: title_en,
                    ReservationUtil: ReservationUtil_1.default
                }, (err, html) => {
                    if (err)
                        return reject(new Error(request.__('Message.UnexpectedError')));
                    let sendgrid = require('sendgrid');
                    let _sendgrid = sendgrid(conf.get('sendgrid_username'), conf.get('sendgrid_password'));
                    let email = new _sendgrid.Email({
                        to: to,
                        fromname: conf.get('email.fromname'),
                        from: conf.get('email.from'),
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
                    let fs = require('fs-extra');
                    email.addFile({
                        filename: `logo.png`,
                        contentType: 'image/png',
                        cid: 'logo',
                        content: fs.readFileSync(`${__dirname}/../../../public/images/email/logo.png`)
                    });
                    this.logger.info('sending an email...email:', email);
                    _sendgrid.send(email, (err, json) => {
                        this.logger.info('an email sent.', err, json);
                        if (err)
                            return reject(err);
                        resolve();
                    });
                });
            });
        }).then(() => {
            return {
                success: true,
                message: null
            };
        }, (err) => {
            return {
                success: false,
                message: err.message
            };
        });
    }
    /**
     * 入場グラグをたてる
     */
    enter(request, id) {
        return new Promise((resolve, reject) => {
            MongooseModels_1.ReservationModel.update({ _id: id }, {
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
    findByMvtkUser() {
        return new Promise((resolve, reject) => {
            // ひとまずデモ段階では、一般予約を10件返す
            MongooseModels_1.ReservationModel.find({
                purchaser_group: ReservationUtil_1.default.PURCHASER_GROUP_CUSTOMER,
                status: ReservationUtil_1.default.STATUS_RESERVED
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
    findById(id) {
        return new Promise((resolve, reject) => {
            MongooseModels_1.ReservationModel.findOne({
                _id: id,
                status: ReservationUtil_1.default.STATUS_RESERVED
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
};
__decorate([
    routing_controllers_1.Post("/api/:locale/reservation/email"),
    __param(0, routing_controllers_1.Req()),
    __param(1, routing_controllers_1.Res()),
    __param(2, routing_controllers_1.Param("locale")), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Object, Object, String]), 
    __metadata('design:returntype', void 0)
], ReservationController.prototype, "email", null);
__decorate([
    routing_controllers_1.Post("/api/reservation/:id/enter"),
    __param(0, routing_controllers_1.Req()),
    __param(1, routing_controllers_1.Param("id")), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Object, String]), 
    __metadata('design:returntype', void 0)
], ReservationController.prototype, "enter", null);
__decorate([
    routing_controllers_1.UseBefore(passport.authenticate('bearer', { session: false })),
    routing_controllers_1.Get("/api/reservations"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', void 0)
], ReservationController.prototype, "findByMvtkUser", null);
__decorate([
    routing_controllers_1.UseBefore(passport.authenticate('bearer', { session: false })),
    routing_controllers_1.Get("/api/reservation/:id"),
    __param(0, routing_controllers_1.Param("id")), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [String]), 
    __metadata('design:returntype', void 0)
], ReservationController.prototype, "findById", null);
ReservationController = __decorate([
    routing_controllers_1.JsonController(), 
    __metadata('design:paramtypes', [])
], ReservationController);
exports.ReservationController = ReservationController;
