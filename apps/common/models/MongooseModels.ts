import mongoose = require('mongoose');

import AuthenticationSchema from '../models/Authentication/AuthenticationSchema';
import CustomerCancelRequestSchema from '../models/CustomerCancelRequest/CustomerCancelRequestSchema';
import FilmSchema from '../models/Film/FilmSchema';
import GMONotificationSchema from '../models/GMONotification/GMONotificationSchema';
import MemberSchema from '../models/Member/MemberSchema';
import PerformanceSchema from '../models/Performance/PerformanceSchema';
import PreCustomerSchema from '../models/PreCustomer/PreCustomerSchema';
import ReservationSchema from '../models/Reservation/ReservationSchema';
import ReservationEmailCueSchema from '../models/ReservationEmailCue/ReservationEmailCueSchema';
import ScreenSchema from '../models/Screen/ScreenSchema';
import SendGridEventNotificationSchema from '../models/SendGridEventNotification/SendGridEventNotificationSchema';
import SequenceSchema from '../models/Sequence/SequenceSchema';
import SponsorSchema from '../models/Sponsor/SponsorSchema';
import StaffSchema from '../models/Staff/StaffSchema';
import TelStaffSchema from '../models/TelStaff/TelStaffSchema';
import TheaterSchema from '../models/Theater/TheaterSchema';
import TicketTypeGroupSchema from '../models/TicketTypeGroup/TicketTypeGroupSchema';
import WindowSchema from '../models/Window/WindowSchema';

/**
 * 作品と予約の整合性を保つ
 */
FilmSchema.post('findOneAndUpdate', function(doc, next){
    ReservationModel.update(
        {
            film: doc['_id']
        },
        {
            film_name_ja: doc["name"]["ja"],
            film_name_en: doc["name"]["en"],
            film_is_mx4d: doc["is_mx4d"],
            film_copyright: doc["copyright"]
        },
        {multi: true},
        (err, raw) => {
            console.log('related reservations updated.', err, raw);
            next();
        }
    );
});

/**
 * 劇場とパフォーマンスの整合性を保つ
 * 劇場と予約の整合性を保つ
 */
TheaterSchema.post('findOneAndUpdate', function(doc, next){
    PerformanceModel.update(
        {
            theater: doc['_id']
        },
        {
            "theater_name.ja": doc["name"]["ja"],
            "theater_name.en": doc["name"]["en"]
        },
        {multi: true},
        (err, raw) => {
            console.log('related performances updated.', err, raw);

            ReservationModel.update(
                {
                    theater: doc['_id']
                },
                {
                    theater_name_ja: doc["name"]["ja"],
                    theater_name_en: doc["name"]["en"],
                    theater_address_ja: doc["address"]["ja"],
                    theater_address_en: doc["address"]["en"]
                },
                {multi: true},
                (err, raw) => {
                    console.log('related reservations updated.', err, raw);
                    next();
                }
            );
        }
    );
});

/**
 * スクリーンとパフォーマンスの整合性を保つ
 * スクリーンと予約の整合性を保つ
 */
ScreenSchema.post('findOneAndUpdate', function(doc, next){
    PerformanceModel.update(
        {
            screen: doc['_id']
        },
        {
            "screen_name.ja": doc["name"]["ja"],
            "screen_name.en": doc["name"]["en"]
        },
        {multi: true},
        (err, raw) => {
            console.log('related performances updated.', err, raw);

            ReservationModel.update(
                {
                    screen: doc['_id']
                },
                {
                    screen_name_ja: doc["name"]["ja"],
                    screen_name_en: doc["name"]["en"]
                },
                {multi: true},
                (err, raw) => {
                    console.log('related reservations updated.', err, raw);
                    next();
                }
            );
        }
    );
});

/**
 * パフォーマンスと予約の整合性を保つ
 */
PerformanceSchema.post('findOneAndUpdate', function(doc, next){
    ReservationModel.update(
        {
            performance: doc['_id']
        },
        {
            performance_day: doc['day'],
            performance_open_time: doc['open_time'],
            performance_start_time: doc['start_time'],
            performance_end_time: doc['end_time'],
            performance_canceled: doc['canceled'],
        },
        {multi: true},
        (err, raw) => {
            console.log('related reservation updated.', err, raw);
            next();
        }
    );
});

/**
 * 外部関係者と予約の整合性を保つ
 */
SponsorSchema.post('findOneAndUpdate', function(doc, next){
    ReservationModel.update(
        {
            sponsor: doc['_id']
        },
        {
            sponsor_name: doc['name'],
            sponsor_email: doc['email']
        },
        {multi: true},
        (err, raw) => {
            console.log('related reservation updated.', err, raw);
            next();
        }
    );
});

/**
 * 内部関係者と予約の整合性を保つ
 */
StaffSchema.post('findOneAndUpdate', function(doc, next){
    ReservationModel.update(
        {
            staff: doc['_id']
        },
        {
            staff_name: doc['name'],
            staff_email: doc['email']
        },
        {multi: true},
        (err, raw) => {
            console.log('related reservation updated.', err, raw);
            next();
        }
    );
});






let AuthenticationModel = mongoose.model('Authentication', AuthenticationSchema);
let CustomerCancelRequestModel = mongoose.model('CustomerCancelRequest', CustomerCancelRequestSchema);
let FilmModel = mongoose.model('Film', FilmSchema);
let GMONotificationModel = mongoose.model('GMONotification', GMONotificationSchema);
let MemberModel = mongoose.model('Member', MemberSchema);
let PerformanceModel = mongoose.model('Performance', PerformanceSchema);
let PreCustomerModel = mongoose.model('PreCustomer', PreCustomerSchema);
let ReservationModel = mongoose.model('Reservation', ReservationSchema);
let ReservationEmailCueModel = mongoose.model('ReservationEmailCue', ReservationEmailCueSchema);
let ScreenModel = mongoose.model('Screen', ScreenSchema);
let SendGridEventNotificationModel = mongoose.model('SendGridEventNotification', SendGridEventNotificationSchema);
let SequenceModel = mongoose.model('Sequence', SequenceSchema);
let SponsorModel = mongoose.model('Sponsor', SponsorSchema);
let StaffModel = mongoose.model('Staff', StaffSchema);
let TelStaffModel = mongoose.model('TelStaff', TelStaffSchema);
let TheaterModel = mongoose.model('Theater', TheaterSchema);
let TicketTypeGroupModel = mongoose.model('TicketTypeGroup', TicketTypeGroupSchema);
let WindowModel = mongoose.model('Window', WindowSchema);

/**
 * MongoDBのモデルをまとめたモジュール
 */
export {
    AuthenticationModel,
    CustomerCancelRequestModel,
    FilmModel,
    GMONotificationModel,
    MemberModel,
    PerformanceModel,
    PreCustomerModel,
    ReservationModel,
    ReservationEmailCueModel,
    ScreenModel,
    SendGridEventNotificationModel,
    SequenceModel,
    SponsorModel,
    StaffModel,
    TelStaffModel,
    TheaterModel,
    TicketTypeGroupModel,
    WindowModel
};