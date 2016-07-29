import ReserveBaseController from '../../ReserveBaseController';
import StaffUser from '../../../models/User/StaffUser';
import Util from '../../../../common/Util/Util';
import reservePerformanceForm from '../../../forms/Reserve/reservePerformanceForm';
import reserveSeatForm from '../../../forms/Reserve/reserveSeatForm';
import reserveTicketForm from '../../../forms/Reserve/reserveTicketForm';

import Models from '../../../../common/models/Models';
import ReservationUtil from '../../../../common/models/Reservation/ReservationUtil';
import FilmUtil from '../../../../common/models/Film/FilmUtil';
import ReservationModel from '../../../models/Reserve/ReservationModel';
import ReservationResultModel from '../../../models/Reserve/ReservationResultModel';

export default class StaffReserveController extends ReserveBaseController {
    public start(): void {
        // 予約トークンを発行
        let token = Util.createToken();
        let reservationModel = new ReservationModel();
        reservationModel.token = token;
        reservationModel.staff = {
            _id: this.staffUser.get('_id'),
            user_id: this.staffUser.get('user_id'),
            name: this.staffUser.get('name'),
            email: this.staffUser.get('email'),
            department_name: this.staffUser.get('department_name'),
            tel: this.staffUser.get('tel'),
            signature: this.staffUser.get('signature'),
        };

        // スケジュール選択へ
        this.logger.debug('saving reservationModel... ', reservationModel);
        reservationModel.save((err) => {
            this.res.redirect(this.router.build('staff.reserve.performances', {token: token}));
        });

    }

    /**
     * スケジュール選択
     */
    public performances(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err || reservationModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            if (this.req.method === 'POST') {
                reservePerformanceForm(this.req, this.res, (err) => {
                    if (this.req.form.isValid) {
                        // パフォーマンスFIX
                        this.processFixPerformance(reservationModel, this.req.form['performanceId'], (err, reservationModel) => {
                            if (err) {
                                this.next(err);
                            } else {

                                this.logger.debug('saving reservationModel... ', reservationModel);
                                reservationModel.save((err) => {
                                    this.res.redirect(this.router.build('staff.reserve.seats', {token: token}));
                                });

                            }
                        });

                    } else {
                        this.next(new Error('不適切なアクセスです'));

                    }

                });
            } else {
                // 仮予約あればキャンセルする
                this.processCancelSeats(reservationModel, (err, reservationModel) => {
                    this.logger.debug('saving reservationModel... ', reservationModel);
                    reservationModel.save((err) => {
                        this.res.render('staff/reserve/performances', {
                            layout: 'layouts/staff/layout',
                            FilmUtil: FilmUtil
                        });
                    });
                });

            }

        });
    }

    /**
     * 座席選択
     * 
     * TODO 1パフォーマンスにつき何件まで？？？
     */
    public seats(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err || reservationModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            this.logger.debug('reservationModel is ', reservationModel.toLog());

            // 外部関係者による予約数を取得
            Models.Reservation.count(
            {
                staff: this.staffUser.get('_id')
            },
            (err, reservationsCount) => {

                if (this.req.method === 'POST') {
                    reserveSeatForm(this.req, this.res, (err) => {
                        if (this.req.form.isValid) {

                            let reservationIds: Array<string> = JSON.parse(this.req.form['reservationIds']);

                            // 座席FIX
                            this.processFixSeats(reservationModel, reservationIds, (err, reservationModel) => {
                                if (err) {
                                    this.next(err);

                                } else {
                                    this.logger.debug('saving reservationModel... ', reservationModel);
                                    reservationModel.save((err) => {
                                        // 仮押さえできていない在庫があった場合
                                        if (reservationIds.length > reservationModel.reservationIds.length) {
                                            // TODO メッセージ？
                                            let message = '座席を確保できませんでした。再度指定してください。';
                                            this.res.redirect(this.router.build('staff.reserve.seats', {token: token}) + `?message=${encodeURIComponent(message)}`);
                                        } else {
                                            this.res.redirect(this.router.build('staff.reserve.tickets', {token: token}));
                                        }
                                    });

                                }
                            });

                        } else {
                            this.res.redirect(this.router.build('staff.reserve.seats', {token: token}));

                        }

                    });
                } else {
                    this.res.render('staff/reserve/seats', {
                        layout: 'layouts/staff/layout',
                        reservationModel: reservationModel,
                    });

                }

            });
        });
    }

    /**
     * 券種選択
     */
    public tickets(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err || reservationModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            this.logger.debug('reservationModel is ', reservationModel.toLog());

            if (this.req.method === 'POST') {
                reserveTicketForm(this.req, this.res, (err) => {
                    if (this.req.form.isValid) {

                        // 座席選択情報を保存して座席選択へ
                        let choices = JSON.parse(this.req.form['choices']);

                        if (Array.isArray(choices)) {
                            choices.forEach((choice) => {
                                let reservation = reservationModel.getReservation(choice.reservation_id);
                                reservation.ticket_type_code = choice.ticket_type_code;
                                reservation.ticket_type_name = choice.ticket_type_name;
                                reservation.ticket_type_name_en = choice.ticket_type_name_en;
                                reservation.ticket_type_charge = parseInt(choice.ticket_type_charge);
                                reservation.watcher_name = choice.watcher_name;

                                reservationModel.setReservation(reservation._id, reservation);
                            });

                            this.logger.debug('saving reservationModel... ', reservationModel);
                            reservationModel.save((err) => {
                                this.res.redirect(this.router.build('staff.reserve.confirm', {token: token}));
                            });

                        } else {
                            this.next(new Error('不適切なアクセスです'));
                        }

                    } else {
                        this.res.redirect(this.router.build('staff.reserve.tickets', {token: token}));

                    }

                });
            } else {
                this.res.render('staff/reserve/tickets', {
                    layout: 'layouts/staff/layout',
                    reservationModel: reservationModel,
                });

            }

        });
    }

    /**
     * 予約内容確認
     */
    public confirm(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err || reservationModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            this.logger.debug('reservationModel is ', reservationModel.toLog());

            if (this.req.method === 'POST') {
                this.res.redirect(this.router.build('staff.reserve.process', {token: token}));
            } else {
                this.res.render('staff/reserve/confirm', {
                    layout: 'layouts/staff/layout',
                    reservationModel: reservationModel
                });
            }
        });
    }

    public process(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err || reservationModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            this.logger.debug('reservationModel is ', reservationModel.toLog());

            if (this.req.method === 'POST') {
            } else {
                // 予約情報セッション削除
                this.logger.debug('removing reservationModel... ', reservationModel);
                reservationModel.remove(() => {
                    if (err) {

                    } else {

                        // ここで予約番号発行
                        reservationModel.paymentNo = Util.createPaymentNo();

                        // 予約プロセス固有のログファイルをセット
                        this.setProcessLogger(reservationModel.paymentNo, () => {
                            this.logger.info('paymentNo published. paymentNo:', reservationModel.paymentNo);
                            this.logger.info('fixing all...');
                            this.processFixAll(reservationModel, (err, reservationModel) => {
                                if (err) {
                                    // TODO 万が一の対応どうするか
                                    this.next(err);

                                } else {
                                    // TODO 予約できていない在庫があった場合
                                    if (reservationModel.reservationIds.length > reservationModel.reservedDocuments.length) {
                                        this.res.redirect(this.router.build('staff.reserve.confirm', {token: token}));

                                    } else {
                                        // 予約結果セッションを保存して、完了画面へ
                                        let reservationResultModel = reservationModel.toReservationResult();

                                        this.logger.info('saving reservationResult...', reservationResultModel.toLog());
                                        reservationResultModel.save((err) => {
                                            this.logger.info('redirecting to complete...');
                                            this.res.redirect(this.router.build('staff.reserve.complete', {token: token}));
                                        });

                                    }

                                }
                            });

                        });

                    }
                });
            }
        });
    }

    public complete(): void {
        let token = this.req.params.token;
        ReservationResultModel.find(token, (err, reservationResultModel) => {
            if (err || reservationResultModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            this.res.render('staff/reserve/complete', {
                layout: 'layouts/staff/layout',
                reservationResultModel: reservationResultModel,
            });
        });
    }
}
