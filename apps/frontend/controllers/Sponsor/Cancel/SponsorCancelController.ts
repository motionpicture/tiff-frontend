import BaseController from '../../BaseController';
import Util from '../../../../common/Util/Util';
import Models from '../../../../common/models/Models';
import ReservationUtil from '../../../../common/models/Reservation/ReservationUtil';
import sponsorCancelForm from '../../../forms/sponsor/sponsorCancelForm';
import log4js = require('log4js');

export default class SponsorCancelController extends BaseController {
    public layout = 'layouts/sponsor/layout';

    /**
     * チケットキャンセル
     */
    public index(): void {
        if (this.req.sponsorUser.isAuthenticated()) {
            // ログイン時そのまま
        } else {
            this.req.setLocale('ja');
        }

        if (this.req.method === 'POST') {
            let form = sponsorCancelForm(this.req);
            form(this.req, this.res, (err) => {
                if (this.req.form.isValid) {
                    // 予約を取得
                    Models.Reservation.find(
                        {
                            payment_no: this.req.form['paymentNo'],
                            purchaser_tel: {$regex: `${this.req.form['last4DigitsOfTel']}$`},
                            purchaser_group: ReservationUtil.PURCHASER_GROUP_SPONSOR,
                            status: ReservationUtil.STATUS_RESERVED
                        },
                        (err, reservations) => {
                            if (err) {
                                return this.res.json({
                                    success: false,
                                    message: this.req.__('Message.UnexpectedError')
                                });
                            }

                            if (reservations.length === 0) {
                                return this.res.json({
                                    success: false,
                                    message: '購入番号または電話番号下4ケタに誤りがあります'
                                });
                            }

                            this.res.json({
                                success: true,
                                message: null,
                                reservations: reservations
                            });
                        }
                    );
                } else {
                    this.res.json({
                        success: false,
                        message: '購入番号または電話番号下4ケタに誤りがあります'
                    });
                }
            });
        } else {
            this.res.locals.paymentNo = '';
            this.res.locals.last4DigitsOfTel = '';

            this.res.render('sponsor/cancel');
        }
    }

    /**
     * 購入番号からキャンセルする
     */
    public executeByPaymentNo(): void {
        this.logger = log4js.getLogger('cancel');

        // TIFF確保にステータス更新
        Models.Reservation.distinct(
            '_id',
            {
                payment_no: this.req.body.paymentNo,
                purchaser_tel: {$regex: `${this.req.body.last4DigitsOfTel}$`},
                purchaser_group: ReservationUtil.PURCHASER_GROUP_SPONSOR,
                status: ReservationUtil.STATUS_RESERVED
            },
            (err, ids) => {
                if (err) {
                    return this.res.json({
                        success: false,
                        message: this.req.__('Message.UnexpectedError')
                    });
                }

                if (ids.length === 0) {
                    return this.res.json({
                        success: false,
                        message: '購入番号または電話番号下4ケタに誤りがあります'
                    });
                }

                let promises = ids.map((id) => {
                    return new Promise((resolve, reject) => {
                        this.logger.info('updating to STATUS_KEPT_BY_TIFF by sponsor... sponsor:', this.req.sponsorUser.get('user_id'), 'id:', id);
                        Models.Reservation.findOneAndUpdate(
                            {_id: id},
                            {status: ReservationUtil.STATUS_KEPT_BY_TIFF},
                            {new: true},
                            (err, raw) => {
                                this.logger.info('updated to STATUS_KEPT_BY_TIFF.', err, raw, 'sponsor:', this.req.sponsorUser.get('user_id'), 'id:', id);
                                (err) ? reject(err) : resolve();
                            }
                        );
                    });
                });

                Promise.all(promises).then(() => {
                    this.res.json({
                        success: true,
                        message: null
                    });
                }, (err) => {
                    this.res.json({
                        success: false,
                        message: err.message
                    });
                });
            }
        );
    }

    public execute(): void {
        this.logger = log4js.getLogger('cancel');

        // 予約IDリストをjson形式で受け取る
        let reservationIds = JSON.parse(this.req.body.reservationIds);
        if (Array.isArray(reservationIds)) {
            let promises = reservationIds.map((id) => {
                return new Promise((resolve, reject) => {
                    this.logger.info('updating to STATUS_KEPT_BY_TIFF by sponsor... sponsor:', this.req.sponsorUser.get('user_id'), 'id:', id);
                    Models.Reservation.findOneAndUpdate(
                        {_id: id},
                        {status: ReservationUtil.STATUS_KEPT_BY_TIFF},
                        {new: true},
                        (err, raw) => {
                            this.logger.info('updated to STATUS_KEPT_BY_TIFF.', err, raw, 'sponsor:', this.req.sponsorUser.get('user_id'), 'id:', id);
                            (err) ? reject(err) : resolve();
                        }
                    );
                });
            });

            Promise.all(promises).then(() => {
                this.res.json({
                    success: true,
                    message: null
                });
            }, (err) => {
                this.res.json({
                    success: false,
                    message: err.message
                });
            });
        } else {
            this.res.json({
                success: false,
                message: this.req.__('Message.UnexpectedError')
            });
        }
    }
}
