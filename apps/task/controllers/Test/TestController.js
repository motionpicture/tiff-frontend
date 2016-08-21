"use strict";
const BaseController_1 = require('../BaseController');
const Util_1 = require('../../../common/Util/Util');
const Models_1 = require('../../../common/models/Models');
const ReservationUtil_1 = require('../../../common/models/Reservation/ReservationUtil');
const conf = require('config');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
let MONGOLAB_URI = conf.get('mongolab_uri');
class TestController extends BaseController_1.default {
    /**
     * 予約を初期化する
     */
    resetReservations() {
        mongoose.connect(MONGOLAB_URI, {});
        Models_1.default.Reservation.remove({}, (err) => {
            this.logger.info('remove processed.', err);
            mongoose.disconnect();
            process.exit(0);
        });
    }
    upsertReservation() {
        mongoose.connect(MONGOLAB_URI, {});
        let promises = [];
        for (let i = 0; i < 3; i++) {
            promises.push(new Promise((resolve, reject) => {
                this.logger.debug('updating reservation...');
                Models_1.default.Reservation.findOneAndUpdate({
                    performance: "57a7c71e59e0a513283e0507",
                    seat_code: "A-2"
                }, {
                    $set: {
                        status: ReservationUtil_1.default.STATUS_TEMPORARY
                    },
                    $setOnInsert: {}
                }, {
                    upsert: true,
                    new: true
                }, (err, reservationDocument) => {
                    this.logger.debug('reservation updated.', err, reservationDocument);
                    resolve();
                });
            }));
        }
        Promise.all(promises).then(() => {
            mongoose.disconnect();
            process.exit(0);
        }, (err) => {
        });
    }
    createIndexes() {
        let MongoClient = mongodb.MongoClient;
        MongoClient.connect(conf.get('mongolab_uri'), (err, db) => {
            let promises = [];
            promises.push(new Promise((resolve, reject) => {
                db.collection('reservations').createIndex({
                    performance: 1,
                    seat_code: 1
                }, {
                    unique: true
                }, (err) => {
                    this.logger.debug('index created.', err);
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
            promises.push(new Promise((resolve, reject) => {
                db.collection('reservation_email_cues').createIndex({
                    payment_no: 1,
                }, {
                    unique: true
                }, (err) => {
                    this.logger.debug('index created.', err);
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
            promises.push(new Promise((resolve, reject) => {
                db.collection('staffs').createIndex({
                    user_id: 1,
                }, {
                    unique: true
                }, (err) => {
                    this.logger.debug('index created.', err);
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
            promises.push(new Promise((resolve, reject) => {
                db.collection('sponsors').createIndex({
                    user_id: 1,
                }, {
                    unique: true
                }, (err) => {
                    this.logger.debug('index created.', err);
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
            promises.push(new Promise((resolve, reject) => {
                db.collection('window').createIndex({
                    user_id: 1,
                }, {
                    unique: true
                }, (err) => {
                    this.logger.debug('index created.', err);
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
            promises.push(new Promise((resolve, reject) => {
                db.collection('tel_staffs').createIndex({
                    user_id: 1,
                }, {
                    unique: true
                }, (err) => {
                    this.logger.debug('index created.', err);
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
            Promise.all(promises).then(() => {
                this.logger.debug('success!');
                db.close();
                process.exit(0);
            }, (err) => {
                db.close();
                process.exit(0);
            });
        });
    }
    createSponsors() {
        mongoose.connect(MONGOLAB_URI, {});
        let password_salt = Util_1.default.createToken();
        Models_1.default.Sponsor.create({
            user_id: 'motionpicture',
            password_salt: password_salt,
            password_hash: Util_1.default.createHash('password', password_salt),
            name: 'モーションピクチャーというスポンサー',
            max_reservation_count: 50,
            performance: '57a3d45ddfada98420a623b2'
        }, () => {
            mongoose.disconnect();
            process.exit(0);
        });
    }
    createWindows() {
        mongoose.connect(MONGOLAB_URI, {});
        let password_salt = Util_1.default.createToken();
        Models_1.default.Window.create({
            user_id: 'motionpicture',
            password_salt: password_salt,
            password_hash: Util_1.default.createHash('12345', password_salt),
            name: '当日窓口モーションピクチャー'
        }, () => {
            mongoose.disconnect();
            process.exit(0);
        });
    }
    createTelStaffs() {
        mongoose.connect(MONGOLAB_URI, {});
        let password_salt = Util_1.default.createToken();
        Models_1.default.TelStaff.create({
            user_id: 'motionpicture',
            password_salt: password_salt,
            password_hash: Util_1.default.createHash('12345', password_salt),
            name: '電話窓口モーションピクチャー'
        }, () => {
            mongoose.disconnect();
            process.exit(0);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestController;
