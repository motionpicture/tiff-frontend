import BaseController from '../../BaseController';
import SponsorUser from '../../../models/User/SponsorUser';
import Util from '../../../../common/Util/Util';
import SponsorReserveLoginForm from '../../../forms/Sponsor/Reserve/SponsorReserveLoginForm';
import SponsorReservePerformanceForm from '../../../forms/Sponsor/Reserve/SponsorReservePerformanceForm';
import SponsorReserveSeatForm from '../../../forms/Sponsor/Reserve/SponsorReserveSeatForm';
import SponsorReserveTicketForm from '../../../forms/Sponsor/Reserve/SponsorReserveTicketForm';
import SponsorReserveProfileForm from '../../../forms/Sponsor/Reserve/SponsorReserveProfileForm';

import Models from '../../../../common/models/Models';
import ReservationUtil from '../../../../common/models/Reservation/ReservationUtil';
import mongoose = require('mongoose');
import ReservationModel from '../../../models/Reserve/ReservationModel';
import ReservationResultModel from '../../../models/Reserve/ReservationResultModel';

export default class SponsorReserveController extends BaseController {
    /**
     * 規約
     */
    public terms(): void {
        if (this.sponsorUser.isAuthenticated()) {
            return this.res.redirect(this.router.build('sponsor.reserve.performances', {}));
        }

        let sponsorReserveLoginForm = new SponsorReserveLoginForm();
        if (this.req.method === 'POST') {

            sponsorReserveLoginForm.form.handle(this.req, {
                success: (form) => {
                    sponsorReserveLoginForm.form = form;

                    // ユーザー認証
                    this.logger.debug('finding sponsor... user_id:', form.data.user_id);
                    Models.Sponsor.findOne(
                    {
                        user_id: form.data.user_id,
                        password: form.data.password,
                    },
                    (err, sponsorDocument) => {

                        if (err || sponsorDocument === null) {
                            this.res.render('sponsor/reserve/terms', {
                                form: form,
                            });
                        } else {
                            // ログイン
                            this.req.session[SponsorUser.AUTH_SESSION_NAME] = sponsorDocument;

                            this.res.redirect(this.router.build('sponsor.reserve.performances', {}));
                        }
                    });
                },
                error: (form) => {
                    this.res.render('sponsor/reserve/terms', {
                        sponsorReserveLoginForm: form,
                    });
                },
                empty: (form) => {
                    this.res.render('sponsor/reserve/terms', {
                        sponsorReserveLoginForm: form,
                    });
                }
            });


        } else {
            this.res.render('sponsor/reserve/terms', {
                form: sponsorReserveLoginForm.form,
            });
        }
    }

    /**
     * スケジュール選択
     */
    public performances(): void {
        let sponsorReservePerformanceForm = new SponsorReservePerformanceForm();
        if (this.req.method === 'POST') {

            sponsorReservePerformanceForm.form.handle(this.req, {
                success: (form) => {
                    sponsorReservePerformanceForm.form = form;

                    // パフォーマンス取得
                    this.logger.debug('searching performance... id:', form.data.performance_id);
                    Models.Performance.findOne(
                        {
                            _id: form.data.performance_id
                        },
                        {}
                    ).populate('film screen theater').exec((err, performanceDocument) => {

                        if (err) {
                            this.next(err);
                        } else {


                            // 予約トークンを発行
                            let token = Util.createToken();
                            let reservationModel = new ReservationModel();
                            reservationModel.token = token;

                            reservationModel.reservationIds = [];

                            // 座席コードごとの券種選択肢リスト
                            let ticketChoicesBySeatCode = {};
                            for (let seatDocument of performanceDocument.get('seats')) {
                                // TODO 外部関係者の場合、ひとまず券種リストを固定にしておく
                                // ticketChoicesBySeatCode[seatDocument.get('code')] = seatDocument.get('tickets');
                                ticketChoicesBySeatCode[seatDocument.get('code')] = [
                                    {
                                        type: '01',
                                        name: '一般',
                                        name_en: 'adult',
                                        price: 1500,
                                    }
                                ];
                            }
                            reservationModel.ticketChoicesBySeatCode = ticketChoicesBySeatCode;


                            // パフォーマンス情報を保存して座席選択へ
                            reservationModel.performance = {
                                _id: performanceDocument.get('_id'),
                                day: performanceDocument.get('day'),
                                start_time: performanceDocument.get('start_time'),
                                end_time: performanceDocument.get('end_time'),
                                theater: {
                                    _id: performanceDocument.get('theater').get('_id'),
                                    name: performanceDocument.get('theater').get('name'),
                                    name_en: performanceDocument.get('theater').get('name_en'),
                                },
                                screen: {
                                    _id: performanceDocument.get('screen').get('_id'),
                                    name: performanceDocument.get('screen').get('name'),
                                    name_en: performanceDocument.get('screen').get('name_en'),
                                    sections: performanceDocument.get('screen').get('sections'),
                                },
                                film: {
                                    _id: performanceDocument.get('film').get('_id'),
                                    name: performanceDocument.get('film').get('name'),
                                    name_en: performanceDocument.get('film').get('name_en'),
                                }
                            };

                            // スクリーンの全座席コード
                            reservationModel.screenSeatCodes = [];
                            for (let seatDocument of performanceDocument.get('screen').get('sections')[0].get('seats')) {
                                reservationModel.screenSeatCodes.push(seatDocument.get('code'));
                            }

                            this.logger.debug('saving reservationModel... ', reservationModel);
                            reservationModel.save((err) => {
                                this.res.redirect(this.router.build('sponsor.reserve.seats', {token: token}));
                            });

                        }

                    });
                },
                error: (form) => {
                    this.next(new Error('不適切なアクセスです'));
                },
                empty: (form) => {
                    this.next(new Error('不適切なアクセスです'));
                }
            });
        } else {
            // パフォーマンスを取得
            Models.Performance.find({}, {}, {sort : {film: 1, day: 1, start_time: 1}, limit: 100})
            .populate('film screen theater') // スペースつなぎで、複数populateできる
            .exec((err, performanceDocuments) => {

                if (err) {
                    this.next(new Error('スケジュールを取得できませんでした'));
                } else {

                    // TODO ここで画面表示に合わせて整形処理を入れる

                    // 作品ごとに
                    let performanceDocumentsByFilm = {};
                    for (let performanceDocument of performanceDocuments) {
                        let filmId = performanceDocument.get('film').get('id');
                        if (!performanceDocumentsByFilm.hasOwnProperty(filmId)) {
                            performanceDocumentsByFilm[filmId] = [];
                        }

                        performanceDocumentsByFilm[filmId].push(performanceDocument);
                    }

                    this.res.render('sponsor/reserve/performances', {
                        form: sponsorReservePerformanceForm.form,
                        performances: performanceDocuments,
                        performanceDocumentsByFilm: performanceDocumentsByFilm,
                    });
                }
            });
        }
    }

    /**
     * 座席選択
     */
    public seats(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err || reservationModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            this.logger.debug('reservationModel is ', reservationModel);


            // 外部関係者による予約数を取得
            Models.Reservation.count(
            {
                sponsor: this.sponsorUser.get('_id')
            },
            (err, reservationsCount) => {

                let sponsorReserveSeatForm = new SponsorReserveSeatForm();
                if (this.req.method === 'POST') {

                    sponsorReserveSeatForm.form.handle(this.req, {
                        success: (form) => {
                            sponsorReserveSeatForm.form = form;

                            let reservationIds: Array<string> = JSON.parse(form.data.reservationIds);
                            let reservationIdsInSession = reservationModel.reservationIds;

                            if (reservationIds.length < 1) {
                                this.next(new Error('不適切なアクセスです'));
                            // 座席指定可能数チェック
                            } else if (reservationIds.length > parseInt(this.sponsorUser.get('max_reservation_count')) - reservationsCount) {
                                let message = '座席指定可能枚数を超えました。';
                                this.res.redirect(this.router.build('sponsor.reserve.seats', {token: token}) + `?message=${encodeURIComponent(message)}`);
                            } else {

                                // 仮押さえ
                                // まず仮押さえしてから、仮押さえキャンセル
                                let promises: Array<Promise<Function>> = [];

                                // セッション中の予約リストを初期化
                                reservationModel.reservationIds = [];

                                reservationIdsInSession.forEach((reservationIdInSession, index) => {
                                    let reservation = reservationModel.getReservation(reservationIdInSession);

                                    if (reservationIds.indexOf(reservationIdInSession) >= 0) {

                                    } else {
                                        // 座席選択肢になければ、空席ステータスに戻す
                                        promises.push(new Promise((resolve, reject) => {

                                            this.logger.debug('updating reservation status to avalilable..._id:', reservationIdInSession);
                                            Models.Reservation.findOneAndUpdate(
                                                {
                                                    _id: reservationIdInSession,
                                                },
                                                {
                                                    status: ReservationUtil.STATUS_AVAILABLE,
                                                },
                                            (err) => {

                                                // 失敗したとしても時間経過で消えるので放置
                                                if (err) {
                                                } else {
                                                }

                                                resolve();
                                            });

                                        }));
                                    }
                                });


                                reservationIds.forEach((reservationId, index) => {

                                    if (reservationIdsInSession.indexOf(reservationId) >= 0) {
                                        // すでに仮押さえ済みであれば、セッションに加えるだけ
                                        promises.push(new Promise((resolve, reject) => {
                                            reservationModel.reservationIds.push(reservationId);

                                            resolve();
                                        }));

                                    } else {

                                        // 新規仮予約
                                        promises.push(new Promise((resolve, reject) => {

                                            this.logger.debug('updating reservation status to temporary...reservationId:', reservationId);
                                            Models.Reservation.findOneAndUpdate(
                                                {
                                                    _id: reservationId,
                                                    status: ReservationUtil.STATUS_AVAILABLE // 空席ステータスのみ、新規仮登録できる(ここはポイントなので要注意！！！)
                                                },
                                                {
                                                    status: ReservationUtil.STATUS_TEMPORARY,
                                                    sponsor: this.sponsorUser.get('_id')
                                                },
                                                {
                                                    new: true,
                                                },
                                            (err, reservationDocument) => {

                                                if (err) {
                                                } else {
                                                    if (reservationDocument) {
                                                        // ステータス更新に成功したらセッションに保管
                                                        reservationModel.reservationIds.push(reservationDocument.get('_id'));
                                                        reservationModel.setReservation(reservationDocument.get('_id'), {
                                                            _id: reservationDocument.get('_id'),
                                                            status: reservationDocument.get('status'),
                                                            seat_code: reservationDocument.get('seat_code'),
                                                            performance: reservationDocument.get('performance'),
                                                        });
                                                    }
                                                }

                                                resolve();
                                            });

                                        }));
                                    }

                                });


                                Promise.all(promises).then(() => {
                                    this.logger.debug('saving reservationModel... ', reservationModel);
                                    reservationModel.save((err) => {
                                        // 仮押さえできていない在庫があった場合
                                        if (reservationIds.length > reservationModel.reservationIds.length) {
                                            // TODO メッセージ？
                                            let message = '座席を確保できませんでした。再度指定してください。';
                                            this.res.redirect(this.router.build('sponsor.reserve.seats', {token: token}) + `?message=${encodeURIComponent(message)}`);
                                        } else {
                                            this.res.redirect(this.router.build('sponsor.reserve.tickets', {token: token}));
                                        }
                                    });

                                }, (err) => {
                                    this.next(err);
                                });
                            }

                        },
                        error: (form) => {
                            this.res.redirect(this.router.build('sponsor.reserve.seats', {token: token}));
                        },
                        empty: (form) => {
                            this.res.redirect(this.router.build('sponsor.reserve.seats', {token: token}));
                        }
                    });
                } else {

                    // 予約リストを取得
                    Models.Reservation.find(
                        {
                            performance: reservationModel.performance._id
                        },
                        {},
                        {},
                        (err, reservationDocuments) => {

                        // 座席コードごとのオブジェクトに整形
                        let reservationDocumentsBySeatCode = {};
                        for (let reservationDocument of reservationDocuments) {
                            reservationDocumentsBySeatCode[reservationDocument.get('seat_code')] = reservationDocument;
                        }

                        if (err) {
                            this.next(new Error('スケジュールを取得できませんでした'));
                        } else {
                            this.res.render('sponsor/reserve/seats', {
                                form: sponsorReserveSeatForm.form,
                                reservationDocumentsBySeatCode: reservationDocumentsBySeatCode,
                                reservationModel: reservationModel,
                                reservationsCount: reservationsCount,
                            });
                        }
                    })
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

            this.logger.debug('reservationModel is ', reservationModel);

            let sponsorReserveTicketForm = new SponsorReserveTicketForm();
            if (this.req.method === 'POST') {

                sponsorReserveTicketForm.form.handle(this.req, {
                    success: (form) => {
                        sponsorReserveTicketForm.form = form;

                        // 座席選択情報を保存して座席選択へ
                        reservationModel.seatChoicesBySponsor = [];
                        let choices = JSON.parse(form.data.choices);

                        if (Array.isArray(choices)) {
                            choices.forEach((choice) => {
                                let reservation = reservationModel.getReservation(choice.reservation_id);
                                reservation.ticket_type = choice.ticket_type;
                                reservation.ticket_name = choice.ticket_name;
                                reservation.ticket_name_en = choice.ticket_name_en;
                                reservation.ticket_price = choice.ticket_price;
                                reservation.watcher_name = choice.watcher_name;

                                reservationModel.setReservation(reservation._id, reservation);
                            });

                            this.logger.debug('saving reservationModel... ', reservationModel);
                            reservationModel.save((err) => {
                                this.res.redirect(this.router.build('sponsor.reserve.profile', {token: token}));
                            });

                        } else {
                            this.next(new Error('不適切なアクセスです'));
                        }

                    },
                    error: (form) => {
                        this.res.redirect(this.router.build('sponsor.reserve.tickets', {token: token}));
                    },
                    empty: (form) => {
                        this.res.redirect(this.router.build('sponsor.reserve.tickets', {token: token}));
                    }
                });
            } else {
                this.res.render('sponsor/reserve/tickets', {
                    form: sponsorReserveTicketForm.form,
                    reservationModel: reservationModel,
                });
            }
        });
    }

    /**
     * 購入者情報
     */
    public profile(): void {
        let token = this.req.params.token;
        ReservationModel.find(token, (err, reservationModel) => {
            if (err || reservationModel === null) {
                return this.next(new Error('予約プロセスが中断されました'));
            }

            this.logger.debug('reservationModel is ', reservationModel);

            let sponsorReserveProfileForm = new SponsorReserveProfileForm();
            if (this.req.method === 'POST') {

                sponsorReserveProfileForm.form.handle(this.req, {
                    success: (form) => {
                        sponsorReserveProfileForm.form = form;

                        // 購入者情報を保存して座席選択へ
                        reservationModel.profile = {
                            last_name: form.data.last_name,
                            first_name: form.data.first_name,
                            email: form.data.email,
                            tel: form.data.tel,
                        };

                        this.logger.debug('saving reservationModel... ', reservationModel);
                        reservationModel.save((err) => {
                            this.res.redirect(this.router.build('sponsor.reserve.confirm', {token: token}));
                        });
                    },
                    error: (form) => {
                        this.res.render('sponsor/reserve/profile', {
                            form: form,
                            reservationModel: reservationModel,
                        });
                    },
                    empty: (form) => {
                        this.res.render('sponsor/reserve/profile', {
                            form: form,
                            reservationModel: reservationModel,
                        });
                    }
                });
            } else {
                // セッションに情報があれば、フォーム初期値設定
                if (reservationModel.profile) {
                    let email = reservationModel.profile.email;
                    sponsorReserveProfileForm.form.fields.last_name.value = reservationModel.profile.last_name;
                    sponsorReserveProfileForm.form.fields.first_name.value = reservationModel.profile.first_name;
                    sponsorReserveProfileForm.form.fields.tel.value = reservationModel.profile.tel;
                    sponsorReserveProfileForm.form.fields.email.value = email;
                    sponsorReserveProfileForm.form.fields.emailConfirm.value = email.substr(0, email.indexOf('@'));
                    sponsorReserveProfileForm.form.fields.emailConfirmDomain.value = email.substr(email.indexOf('@') + 1);
                }

                this.res.render('sponsor/reserve/profile', {
                    form: sponsorReserveProfileForm.form,
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

            this.logger.debug('reservationModel is ', reservationModel);

            if (this.req.method === 'POST') {
                this.res.redirect(this.router.build('sponsor.reserve.process', {token: token}));
            } else {
                this.res.render('sponsor/reserve/confirm', {
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

            this.logger.debug('reservationModel is ', reservationModel);

            if (this.req.method === 'POST') {
            } else {
                // 予約番号発行
                reservationModel.paymentNo = Util.createPaymentNo();

                // 予約情報セッション削除
                this.logger.debug('removing reservationModel... ', reservationModel);
                reservationModel.remove(() => {
                    if (err) {

                    } else {
                        // 予約ステータス更新
                        let reservedDocuments: Array<mongoose.Document> = [];

                        let promises = [];
                        reservationModel.reservationIds.forEach((reservationId, index) => {
                            let reservation = reservationModel.getReservation(reservationId);

                            promises.push(new Promise((resolve, reject) => {

                                this.logger.debug('updating reservation status to STATUS_RESERVED..._id:', reservationId);
                                Models.Reservation.findOneAndUpdate(
                                    {
                                        _id: reservationId,
                                    },
                                    {
                                        payment_no: reservationModel.paymentNo,
                                        status: ReservationUtil.STATUS_RESERVED,
                                        performance: reservationModel.performance._id,
                                        performance_day: reservationModel.performance.day,
                                        performance_start_time: reservationModel.performance.start_time,
                                        performance_end_time: reservationModel.performance.end_time,
                                        theater: reservationModel.performance.theater._id,
                                        theater_name: reservationModel.performance.theater.name,
                                        screen: reservationModel.performance.screen._id,
                                        screen_name: reservationModel.performance.screen.name,
                                        film: reservationModel.performance.film._id,
                                        film_name: reservationModel.performance.film.name,
                                        purchaser_last_name: reservationModel.profile.last_name,
                                        purchaser_first_name: reservationModel.profile.first_name,
                                        purchaser_email: reservationModel.profile.email,
                                        purchaser_tel: reservationModel.profile.tel,
                                        ticket_type: reservation.ticket_type,
                                        ticket_name: reservation.ticket_name,
                                        ticket_name_en: reservation.ticket_name_en,
                                        ticket_price: reservation.ticket_price,
                                        watcher_name: reservation.watcher_name,
                                        sponsor: this.sponsorUser.get('_id'),
                                        sponsor_user_id: this.sponsorUser.get('user_id'),
                                        sponsor_name: this.sponsorUser.get('name'),
                                        sponsor_email: this.sponsorUser.get('email'),
                                        created_user: this.constructor.toString(),
                                        updated_user: this.constructor.toString(),
                                    },
                                    {
                                        new: true
                                    },
                                (err, reservationDocument) => {

                                    this.logger.info('reservation status to STATUS_RESERVED updated.', err, reservationDocument, reservationModel);

                                    if (err) {
                                    } else {
                                        // ステータス更新に成功したらリストに追加
                                        reservedDocuments.push(reservationDocument);
                                    }

                                    resolve();
                                });

                            }));
                        });

                        Promise.all(promises).then(() => {

                            // TODO 予約できていない在庫があった場合
                            if (reservationModel.reservationIds.length > reservedDocuments.length) {
                                this.res.redirect(this.router.build('sponsor.reserve.confirm', {token: token}));
                            } else {
                                // 予約結果セッションを保存して、完了画面へ
                                let reservationResultModel = reservationModel.toReservationResult();

                                this.logger.debug('saving reservationResult...', reservationResultModel);
                                reservationResultModel.save((err) => {
                                    this.res.redirect(this.router.build('sponsor.reserve.complete', {token: token}));
                                });
                            }

                        }, (err) => {
                            // TODO 万が一の対応どうするか
                            this.next(err);
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

            this.res.render('sponsor/reserve/complete', {
                reservationResultModel: reservationResultModel,
            });
        });
    }
}