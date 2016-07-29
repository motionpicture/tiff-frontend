import BaseController from '../BaseController';
import Util from '../../../common/Util/Util';
import Models from '../../../common/models/Models';
import ReservationUtil from '../../../common/models/Reservation/ReservationUtil';
import PerformanceStatusesModel from '../../../common/models/PerformanceStatusesModel';
import moment = require('moment');

export default class PerformanceController extends BaseController {
    /**
     * パフォーマンス検索API
     */
    public search(): void {
        let limit = (this.req.query.limit) ? this.req.query.limit : 100;
        let page = (this.req.query.page) ? this.req.query.page : 1;

        let day = (this.req.query.day) ? this.req.query.day : null; // 上映日
        let section = (this.req.query.section) ? this.req.query.section : null; // 部門
        let genre = (this.req.query.genre) ? this.req.query.genre : null; // ジャンル
        let words = (this.req.query.words) ? this.req.query.words : null; // フリーワード

        // 検索条件を作成
        let andConditions: Array<Object> = [];

        if (day) {
            andConditions.push({
                'day': day
            });
        } else {
            // 日付指定がない場合は、上映開始時刻が20分前以降のもののみ
            let today = moment().add(-20, 'minutes');
            let tomorrow = moment().add(+1420, 'minutes');
            andConditions.push({
                $or: [
                    {
                        'day': today.format('YYYYMMDD'),
                        'start_time': {
                            $gte: today.format('HHmm')
                        }
                    },
                    {
                        'day': {
                            $gte: tomorrow.format('YYYYMMDD')
                        }
                    }
                ]
            });
        }


        // 作品条件を追加する
        this.addFilmConditions(andConditions, section, genre, words, (err, andConditions) => {

            let conditions = null;
            if (andConditions.length > 0) {
                conditions = {
                    $and: andConditions
                };
            }
            this.logger.debug('conditions:', conditions);

            // 総数検索
            Models.Performance.count(
                conditions,
                (err, count) => {

                    let query = Models.Performance.find(
                        conditions,
                        'day start_time end_time film screen theater' // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                    ).skip(limit * (page - 1)).limit(limit);

                    if (this.req.getLocale() === 'ja') {
                        query.populate('film', 'name') // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                             .populate('screen', 'name') // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                          　 .populate('theater', 'name') // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                    } else {
                        query.populate('film', 'name_en') // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                             .populate('screen', 'name_en') // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                             .populate('theater', 'name_en') // 必要な項目だけ指定すること(レスポンスタイムに大きく影響するので)
                    }

                    // 上映日、開始時刻
                    // TODO 作品名昇順を追加？
                    query.setOptions({
                        sort : {
                            day: 1,
                            start_time: 1,
                            // 'film.name_en': 1
                        },
                    });

                    query.exec((err, performanceDocuments) => {
                        this.logger.debug('find performances processed.', err);

                        let results = [];

                        // 空席情報を追加
                        PerformanceStatusesModel.find((err, performanceStatusesModel) => {
                            performanceDocuments.forEach((performanceDocument) => {
                                let result = performanceDocument.toObject();
                                result['seat_status'] = performanceStatusesModel.getStatus(performanceDocument.get('_id'));
                                results.push(result);
                            });

                            if (err) {
                                this.res.json({
                                    isSuccess: false,
                                    results: [],
                                    count: 0
                                });

                            } else {
                                this.res.json({
                                    isSuccess: true,
                                    results: results,
                                    count: count
                                });

                            }

                        });

                    });
                }
            );
        });
    }

    private addFilmConditions(andConditions: Array<Object>, section: string, genre: string, words: string, cb: (err: Error, andConditions: Array<Object>) => void) {

        let filmAndConditions: Array<Object> = [];
        if (section) {
            // 部門条件の追加
            filmAndConditions.push({
                'sections.code': {$in: [section]}
            });
        }

        if (genre) {
            // ジャンル条件の追加
            filmAndConditions.push({
                'genres.code': {$in: [genre]}
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
                        'name': {$regex: `${regex}`}
                    },
                    {
                        'name_en': {$regex: `${regex}`}
                    }
                );
            }

            filmAndConditions.push({
                $or: orConditions
            });
        }

        if (filmAndConditions.length > 0) {
            let filmConditions = {
                $and: filmAndConditions
            };

            Models.Film.find(
                filmConditions,
                '_id',
                {},
                (err, filmDocuments) => {
                    if (err) {
                        cb(err, andConditions);
                    } else {
                        let filmIds = filmDocuments.map((filmDocument) => {
                            return filmDocument.get('_id');
                        });

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

                        cb(null, andConditions);
                    }
                }
            )
        } else {
            cb(null, andConditions);
        }
    }
}
