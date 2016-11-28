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
const Models_1 = require('../../common/models/Models');
const PerformanceStatusesModel_1 = require('../../common/models/PerformanceStatusesModel');
let PerformanceController = class PerformanceController extends BaseController_1.BaseController {
    environmentVariables() {
        return {
            success: true,
            variables: process.env
        };
    }
    /**
     * パフォーマンス検索API
     */
    search(request, response, locale) {
        let limit = (request.query.limit) ? parseInt(request.query.limit) : null;
        let page = (request.query.page) ? parseInt(request.query.page) : 1;
        let day = (request.query.day) ? request.query.day : null; // 上映日
        let section = (request.query.section) ? request.query.section : null; // 部門
        let words = (request.query.words) ? request.query.words : null; // フリーワード
        let startFrom = (request.query.start_from) ? parseInt(request.query.start_from) : null; // この時間以降開始のパフォーマンスに絞る(timestamp milliseconds)
        let theater = (request.query.theater) ? request.query.theater : null; // 劇場
        let screen = (request.query.screen) ? request.query.screen : null; // スクリーン
        // 検索条件を作成
        let andConditions = [
            { canceled: false }
        ];
        if (day) {
            andConditions.push({
                day: day
            });
        }
        if (theater) {
            andConditions.push({
                theater: theater
            });
        }
        if (screen) {
            andConditions.push({
                screen: screen
            });
        }
        if (startFrom) {
            let moment = require('moment');
            let now = moment(startFrom);
            let tomorrow = moment(startFrom).add(+24, 'hours');
            andConditions.push({
                $or: [
                    {
                        day: now.format('YYYYMMDD'),
                        start_time: {
                            $gte: now.format('HHmm')
                        }
                    },
                    {
                        day: {
                            $gte: tomorrow.format('YYYYMMDD')
                        }
                    }
                ]
            });
        }
        // 作品条件を追加する
        return this.addFilmConditions(andConditions, section, words).then((andConditions) => {
            let conditions = null;
            if (andConditions.length > 0) {
                conditions = {
                    $and: andConditions
                };
            }
            // 作品件数取得
            return Models_1.default.Performance.distinct('film', conditions).then((filmIds) => {
                // 総数検索
                return Models_1.default.Performance.count(conditions).then((performances_count) => {
                    // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                    let fields = '';
                    if (locale === 'ja') {
                        fields = 'day open_time start_time film screen screen_name.ja theater theater_name.ja';
                    }
                    else {
                        fields = 'day open_time start_time film screen screen_name.en theater theater_name.en';
                    }
                    let query = Models_1.default.Performance.find(conditions, fields);
                    if (limit) {
                        query.skip(limit * (page - 1)).limit(limit);
                    }
                    if (locale === 'ja') {
                        query.populate('film', 'name.ja sections.name.ja minutes copyright');
                    }
                    else {
                        query.populate('film', 'name.en sections.name.en minutes copyright');
                    }
                    // 上映日、開始時刻
                    query.setOptions({
                        sort: {
                            day: 1,
                            start_time: 1
                        },
                    });
                    return query.lean(true).exec().then((performances) => {
                        // 空席情報を追加
                        let conf = require('config');
                        return new Promise((resolve, reject) => {
                            PerformanceStatusesModel_1.default.find((err, performanceStatusesModel) => {
                                resolve(performanceStatusesModel);
                            });
                        }).then((performanceStatusesModel) => {
                            let results = performances.map((performance) => {
                                return {
                                    _id: performance['_id'],
                                    day: performance['day'],
                                    open_time: performance['open_time'],
                                    start_time: performance['start_time'],
                                    seat_status: (performanceStatusesModel) ? performanceStatusesModel.getStatus(performance['_id'].toString()) : null,
                                    theater_name: performance['theater_name'][locale],
                                    screen_name: performance['screen_name'][locale],
                                    film_id: performance['film']['_id'],
                                    film_name: performance['film']['name'][locale],
                                    film_sections: performance['film']['sections'].map((section) => { return section['name'][locale]; }),
                                    film_minutes: performance['film']['minutes'],
                                    film_copyright: performance['film']['copyright'],
                                    film_image: `https://${conf.get('dns_name')}/images/film/${performance['film']['_id']}.jpg`
                                };
                            });
                            return {
                                success: true,
                                results: results,
                                performances_count: performances_count,
                                films_count: filmIds.length
                            };
                        });
                    });
                });
            });
        });
    }
    addFilmConditions(andConditions, section, words) {
        let filmAndConditions = [];
        if (section) {
            // 部門条件の追加
            filmAndConditions.push({
                'sections.code': { $in: [section] }
            });
        }
        // フリーワードの検索対象はタイトル(日英両方)
        // 空白つなぎでOR検索
        if (words) {
            // trim and to half-width space
            words = words.replace(/(^\s+)|(\s+$)/g, '').replace(/\s/g, ' ');
            let regexes = words.split(' ').filter((value) => { return (value.length > 0); });
            let orConditions = [];
            for (let regex of regexes) {
                orConditions.push({
                    'name.ja': { $regex: `${regex}` }
                }, {
                    'name.en': { $regex: `${regex}` }
                });
            }
            filmAndConditions.push({
                $or: orConditions
            });
        }
        if (filmAndConditions.length === 0) {
            // 全作品数を取得
            return new Promise((resolve, reject) => {
                resolve(andConditions);
            });
        }
        let filmConditions = {
            $and: filmAndConditions
        };
        return Models_1.default.Film.distinct('_id', filmConditions).then((filmIds) => {
            if (filmIds.length > 0) {
                andConditions.push({
                    'film': {
                        $in: filmIds
                    }
                });
            }
            else {
                // 検索結果のない条件を追加
                andConditions.push({
                    'film': null
                });
            }
            return andConditions;
        });
    }
};
__decorate([
    routing_controllers_1.Get("/api/environmentVariables"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', void 0)
], PerformanceController.prototype, "environmentVariables", null);
__decorate([
    routing_controllers_1.Get("/api/:locale/performance/search"),
    __param(0, routing_controllers_1.Req()),
    __param(1, routing_controllers_1.Res()),
    __param(2, routing_controllers_1.Param("locale")), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Object, Object, String]), 
    __metadata('design:returntype', void 0)
], PerformanceController.prototype, "search", null);
PerformanceController = __decorate([
    routing_controllers_1.JsonController(), 
    __metadata('design:paramtypes', [])
], PerformanceController);
exports.PerformanceController = PerformanceController;
