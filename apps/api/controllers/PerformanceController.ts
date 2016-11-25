import {Request, Response} from "express";
import {JsonController, Req, Res, Param, Body, Get, Post, Put, Delete} from "routing-controllers";
import Models from '../../common/models/Models';
import PerformanceStatusesModel from '../../common/models/PerformanceStatusesModel';
import Moment = require('moment');
import Conf = require('config');

@JsonController()
export class PerformanceController {
    @Get("/api/environmentVariables")
    environmentVariables() {
        return {
            success: true,
            variables: process.env
        };
    }

    @Get("/api/performances")
    getAll() {
        return Models.Performance.find().lean(true).exec().then((performances) => {
            return {
                success: true,
            };
        });
    }

    /**
     * パフォーマンス検索API
     */
    @Get("/api/:locale/performance/search")
    public search(@Req() request: Request, @Res() response: Response, @Param("locale") locale: string) {
        let limit: number = (request.query.limit) ? parseInt(request.query.limit) : null;
        let page: number = (request.query.page) ? parseInt(request.query.page) : 1;

        let day: string = (request.query.day) ? request.query.day : null; // 上映日
        let section: string = (request.query.section) ? request.query.section : null; // 部門
        let words: string = (request.query.words) ? request.query.words : null; // フリーワード
        let startFrom: number = (request.query.start_from) ? parseInt(request.query.start_from) : null; // この時間以降開始のパフォーマンスに絞る(timestamp milliseconds)
        let theater: string = (request.query.theater) ? request.query.theater : null; // 劇場
        let screen: string = (request.query.screen) ? request.query.screen : null; // スクリーン

        // 検索条件を作成
        let andConditions: Array<Object> = [
            {canceled: false}
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
            let moment: typeof Moment = require('moment');
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
            return Models.Performance.distinct('film', conditions).then((filmIds) => {
                // 総数検索
                return Models.Performance.count(conditions).then((performances_count) => {

                    // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                    let fields = '';
                    if (request.getLocale() === 'ja') {
                        fields = 'day open_time start_time film screen screen_name.ja theater theater_name.ja';
                    } else {
                        fields = 'day open_time start_time film screen screen_name.en theater theater_name.en';
                    }
                    let query = Models.Performance.find(
                        conditions,
                        fields
                    )

                    if (limit) {
                        query.skip(limit * (page - 1)).limit(limit);
                    }

                    if (request.getLocale() === 'ja') {
                        query.populate('film', 'name.ja sections.name.ja minutes copyright');
                    } else {
                        query.populate('film', 'name.en sections.name.en minutes copyright');
                    }

                    // 上映日、開始時刻
                    query.setOptions({
                        sort : {
                            day: 1,
                            start_time: 1
                        },
                    });

                    return query.lean(true).exec().then((performances: Array<any>) => {
                        // 空席情報を追加
                        let conf: typeof Conf = require('config');
                        // PerformanceStatusesModel.find((err, performanceStatusesModel) => {
                            let results = performances.map((performance) => {
                                return {
                                    _id: performance['_id'],
                                    day: performance['day'],
                                    open_time: performance['open_time'],
                                    start_time: performance['start_time'],
                                    // seat_status: (performanceStatusesModel) ? performanceStatusesModel.getStatus(performance['_id'].toString()) : null,
                                    theater_name: performance['theater_name'][request.getLocale()],
                                    screen_name: performance['screen_name'][request.getLocale()],
                                    film_id: performance['film']['_id'],
                                    film_name: performance['film']['name'][request.getLocale()],
                                    film_sections: performance['film']['sections'].map((section) => {return section['name'][request.getLocale()];}),
                                    film_minutes: performance['film']['minutes'],
                                    film_copyright: performance['film']['copyright'],
                                    film_image: `https://${conf.get<string>('dns_name')}/images/film/${performance['film']['_id']}.jpg`
                                };
                            });

                            response.json({
                                success: true,
                                results: results,
                                performances_count: performances_count,
                                films_count: filmIds.length
                            });
                        // });
                    });

                });
            });
        });
    }

    private addFilmConditions(andConditions: Array<Object>, section: string, words: string): Promise<(andConditions: Array<Object>) => {}> {
        let filmAndConditions: Array<Object> = [];
        if (section) {
            // 部門条件の追加
            filmAndConditions.push({
                'sections.code': {$in: [section]}
            });
        }

        // フリーワードの検索対象はタイトル(日英両方)
        // 空白つなぎでOR検索
        if (words) {
            // trim and to half-width space
            words = words.replace(/(^\s+)|(\s+$)/g, '').replace(/\s/g, ' ');
            let regexes = words.split(' ').filter((value) => {return (value.length > 0)});

            let orConditions = [];
            for (let regex of regexes) {
                orConditions.push(
                    {
                        'name.ja': {$regex: `${regex}`}
                    },
                    {
                        'name.en': {$regex: `${regex}`}
                    }
                );
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

        return Models.Film.distinct('_id', filmConditions).then((filmIds) => {
            if (filmIds.length > 0) {
                andConditions.push({
                    'film': {
                        $in: filmIds
                    }
                });
            } else {
                // 検索結果のない条件を追加
                andConditions.push({
                    'film': null
                });
            }

            return andConditions;
        });
    }
}
