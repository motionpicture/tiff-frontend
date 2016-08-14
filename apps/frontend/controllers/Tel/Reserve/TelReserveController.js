"use strict";
const ReserveBaseController_1 = require('../../ReserveBaseController');
const Util_1 = require('../../../../common/Util/Util');
const GMOUtil_1 = require('../../../../common/Util/GMO/GMOUtil');
const reservePerformanceForm_1 = require('../../../forms/Reserve/reservePerformanceForm');
const reserveSeatForm_1 = require('../../../forms/Reserve/reserveSeatForm');
const reserveTicketForm_1 = require('../../../forms/Reserve/reserveTicketForm');
const reserveProfileForm_1 = require('../../../forms/Reserve/reserveProfileForm');
const Models_1 = require('../../../../common/models/Models');
const ReservationUtil_1 = require('../../../../common/models/Reservation/ReservationUtil');
const FilmUtil_1 = require('../../../../common/models/Film/FilmUtil');
const ReservationModel_1 = require('../../../models/Reserve/ReservationModel');
class TelReserveController extends ReserveBaseController_1.default {
    start() {
        // 予約トークンを発行
        let token = Util_1.default.createToken();
        let reservationModel = new ReservationModel_1.default();
        reservationModel.token = token;
        reservationModel.purchaserGroup = ReservationUtil_1.default.PURCHASER_GROUP_TEL;
        // 購入番号発行(確認画面でペイデザイン川にコピーする際に必要になるので、事前に発行しておく)
        this.createPaymentNo((err, paymentNo) => {
            if (err)
                return this.next(new Error(this.req.__('Message.UnexpectedError')));
            reservationModel.paymentNo = paymentNo;
            // スケジュール選択へ
            reservationModel.save((err) => {
                this.res.redirect(this.router.build('tel.reserve.performances', { token: token }));
            });
        });
    }
    /**
     * スケジュール選択
     */
    performances() {
        let token = this.req.params.token;
        ReservationModel_1.default.find(token, (err, reservationModel) => {
            if (err)
                return this.next(new Error(this.req.__('Message.Expired')));
            if (this.req.method === 'POST') {
                reservePerformanceForm_1.default(this.req, this.res, (err) => {
                    if (this.req.form.isValid) {
                        // パフォーマンスFIX
                        this.processFixPerformance(reservationModel, this.req.form['performanceId'], (err, reservationModel) => {
                            if (err) {
                                this.next(err);
                            }
                            else {
                                this.logger.debug('saving reservationModel... ', reservationModel);
                                reservationModel.save((err) => {
                                    this.res.redirect(this.router.build('tel.reserve.seats', { token: token }));
                                });
                            }
                        });
                    }
                    else {
                        this.next(new Error(this.req.__('Message.UnexpectedError')));
                    }
                });
            }
            else {
                // 仮予約あればキャンセルする
                this.processCancelSeats(reservationModel, (err, reservationModel) => {
                    this.logger.debug('saving reservationModel... ', reservationModel);
                    reservationModel.save((err) => {
                        this.res.render('tel/reserve/performances', {
                            layout: 'layouts/tel/layout',
                            FilmUtil: FilmUtil_1.default
                        });
                    });
                });
            }
        });
    }
    /**
     * 座席選択
     */
    seats() {
        let token = this.req.params.token;
        ReservationModel_1.default.find(token, (err, reservationModel) => {
            if (err)
                return this.next(new Error(this.req.__('Message.Expired')));
            let limit = 4;
            if (this.req.method === 'POST') {
                reserveSeatForm_1.default(this.req, this.res, (err) => {
                    if (this.req.form.isValid) {
                        let seatCodes = JSON.parse(this.req.form['seatCodes']);
                        // 追加指定席を合わせて制限枚数を超過した場合
                        if (seatCodes.length > limit) {
                            let message = this.req.__('Message.seatsLimit{{limit}}', { limit: limit.toString() });
                            this.res.redirect(`${this.router.build('tel.reserve.seats', { token: token })}?message=${encodeURIComponent(message)}`);
                        }
                        else {
                            // 仮予約あればキャンセルする
                            this.logger.debug('processCancelSeats processing...');
                            this.processCancelSeats(reservationModel, (err, reservationModel) => {
                                this.logger.debug('processCancelSeats processed.', err);
                                // 座席FIX
                                this.processFixSeats(reservationModel, seatCodes, (err, reservationModel) => {
                                    if (err) {
                                        reservationModel.save((err) => {
                                            let message = this.req.__('Mesasge.SelectedSeatsUnavailable');
                                            this.res.redirect(`${this.router.build('tel.reserve.seats', { token: token })}?message=${encodeURIComponent(message)}`);
                                        });
                                    }
                                    else {
                                        reservationModel.save((err) => {
                                            // 券種選択へ
                                            this.res.redirect(this.router.build('tel.reserve.tickets', { token: token }));
                                        });
                                    }
                                });
                            });
                        }
                    }
                    else {
                        this.res.redirect(this.router.build('tel.reserve.seats', { token: token }));
                    }
                });
            }
            else {
                this.res.render('tel/reserve/seats', {
                    layout: 'layouts/tel/layout',
                    reservationModel: reservationModel,
                    limit: limit
                });
            }
        });
    }
    /**
     * 券種選択
     */
    tickets() {
        let token = this.req.params.token;
        ReservationModel_1.default.find(token, (err, reservationModel) => {
            if (err)
                return this.next(new Error(this.req.__('Message.Expired')));
            reservationModel.paymentMethod = null;
            if (this.req.method === 'POST') {
                reserveTicketForm_1.default(this.req, this.res, (err) => {
                    if (this.req.form.isValid) {
                        // 座席選択情報を保存して座席選択へ
                        let choices = JSON.parse(this.req.form['choices']);
                        if (Array.isArray(choices)) {
                            choices.forEach((choice) => {
                                let reservation = reservationModel.getReservation(choice.seat_code);
                                let ticketType = reservationModel.ticketTypes.find((ticketType) => {
                                    return (ticketType.code === choice.ticket_type_code);
                                });
                                if (!ticketType) {
                                    return this.next(new Error(this.req.__('Message.UnexpectedError')));
                                }
                                reservation.ticket_type_code = ticketType.code;
                                reservation.ticket_type_name = ticketType.name;
                                reservation.ticket_type_name_en = ticketType.name_en;
                                reservation.ticket_type_charge = ticketType.charge;
                                ;
                                reservationModel.setReservation(reservation._id, reservation);
                            });
                            this.logger.debug('saving reservationModel... ');
                            reservationModel.save((err) => {
                                this.res.redirect(this.router.build('tel.reserve.profile', { token: token }));
                            });
                        }
                        else {
                            this.next(new Error(this.req.__('Message.UnexpectedError')));
                        }
                    }
                    else {
                        this.res.redirect(this.router.build('tel.reserve.tickets', { token: token }));
                    }
                });
            }
            else {
                this.res.render('tel/reserve/tickets', {
                    layout: 'layouts/tel/layout',
                    reservationModel: reservationModel,
                });
            }
        });
    }
    /**
     * 購入者情報
     */
    profile() {
        let token = this.req.params.token;
        ReservationModel_1.default.find(token, (err, reservationModel) => {
            if (err)
                return this.next(new Error(this.req.__('Message.Expired')));
            if (this.req.method === 'POST') {
                let form = reserveProfileForm_1.default(this.req);
                form(this.req, this.res, (err) => {
                    if (this.req.form.isValid) {
                        // 購入者情報を保存して座席選択へ
                        reservationModel.profile = {
                            last_name: this.req.form['lastName'],
                            first_name: this.req.form['firstName'],
                            email: '',
                            tel: this.req.form['tel']
                        };
                        reservationModel.paymentMethod = GMOUtil_1.default.PAY_TYPE_CVS; // コンビニで固定
                        this.logger.debug('saving reservationModel... ');
                        reservationModel.save((err) => {
                            this.res.redirect(this.router.build('tel.reserve.confirm', { token: token }));
                        });
                    }
                    else {
                        this.res.render('tel/reserve/profile', {
                            layout: 'layouts/tel/layout',
                            reservationModel: reservationModel
                        });
                    }
                });
            }
            else {
                this.res.locals.lastName = '';
                this.res.locals.firstName = '';
                this.res.locals.tel = '';
                this.res.locals.paymentMethod = GMOUtil_1.default.PAY_TYPE_CVS;
                // セッションに情報があれば、フォーム初期値設定
                if (reservationModel.profile) {
                    this.res.locals.lastName = reservationModel.profile.last_name;
                    this.res.locals.firstName = reservationModel.profile.first_name;
                    this.res.locals.tel = reservationModel.profile.tel;
                }
                this.res.render('tel/reserve/profile', {
                    layout: 'layouts/tel/layout',
                    reservationModel: reservationModel
                });
            }
        });
    }
    /**
     * 予約内容確認
     */
    confirm() {
        let token = this.req.params.token;
        ReservationModel_1.default.find(token, (err, reservationModel) => {
            if (err)
                return this.next(new Error(this.req.__('Message.Expired')));
            if (this.req.method === 'POST') {
                // 予約プロセス固有のログファイルをセット(購入番号は最初に発行済み)
                this.setProcessLogger(reservationModel.paymentNo, () => {
                    this.logger.info('paymentNo published. paymentNo:', reservationModel.paymentNo);
                    let promises = [];
                    let reservationDocuments4update = reservationModel.toReservationDocuments();
                    for (let reservationDocument4update of reservationDocuments4update) {
                        promises.push(new Promise((resolve, reject) => {
                            // 予約完了
                            reservationDocument4update['status'] = ReservationUtil_1.default.STATUS_WAITING_SETTLEMENT_PAY_DESIGN;
                            reservationDocument4update['purchased_at'] = Date.now();
                            reservationDocument4update['tel_staff'] = this.telStaffUser.get('_id');
                            reservationDocument4update['tel_staff_user_id'] = this.telStaffUser.get('user_id');
                            this.logger.info('updating reservation all infos..._id:', reservationDocument4update['_id']);
                            Models_1.default.Reservation.update({
                                _id: reservationDocument4update['_id'],
                                status: ReservationUtil_1.default.STATUS_TEMPORARY
                            }, reservationDocument4update, (err, raw) => {
                                this.logger.info('reservation updated.', err, raw);
                                if (err) {
                                    reject(new Error(this.req.__('Message.UnexpectedError')));
                                }
                                else {
                                    resolve();
                                }
                            });
                        }));
                    }
                    ;
                    Promise.all(promises).then(() => {
                        reservationModel.remove((err) => {
                            this.logger.info('redirecting to complete...');
                            this.res.redirect(this.router.build('tel.reserve.complete', { paymentNo: reservationModel.paymentNo }));
                        });
                    }, (err) => {
                        let message = err.message;
                        this.res.redirect(`${this.router.build('tel.reserve.confirm', { token: token })}?message=${encodeURIComponent(message)}`);
                    });
                });
            }
            else {
                this.res.render('tel/reserve/confirm', {
                    layout: 'layouts/tel/layout',
                    reservationModel: reservationModel
                });
            }
        });
    }
    /**
     * 予約完了
     */
    complete() {
        let paymentNo = this.req.params.paymentNo;
        Models_1.default.Reservation.find({
            payment_no: paymentNo,
            status: ReservationUtil_1.default.STATUS_WAITING_SETTLEMENT_PAY_DESIGN,
            tel_staff: this.telStaffUser.get('_id')
        }, (err, reservationDocuments) => {
            if (err)
                return this.next(new Error(this.req.__('Message.UnexpectedError')));
            if (reservationDocuments.length === 0)
                return this.next(new Error(this.req.__('Message.NotFound')));
            this.res.render('tel/reserve/complete', {
                layout: 'layouts/tel/layout',
                reservationDocuments: reservationDocuments
            });
        });
    }
}
TelReserveController.RESERVATION_LIMIT_PER_PERFORMANCE = 4; // パフォーマンスあたりの最大座席確保枚数
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TelReserveController;