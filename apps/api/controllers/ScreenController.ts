import {BaseController} from './BaseController';
import {Request, Response} from "express";
import {Controller, ContentType, Get, Param} from "routing-controllers";
import {ScreenModel} from '../../common/models/MongooseModels';
import Fs = require('fs-extra');

@Controller()
export class ScreenController extends BaseController {
    /**
     * スクリーンの座席マップを生成する
     */
    @Get("/api/screen/:id/show")
    @ContentType("text/plain")
    show(@Param("id") id: string) {
        // スクリーンを取得
        return ScreenModel.count({_id: id}).then((count) => {
            if (count === 0) return 'false';

            // スクリーン座席表HTMLを出力
            let fs: typeof Fs = require('fs-extra');
            return fs.readFileSync(`${__dirname}/../../common/views/screens/${id}.ejs`, 'utf8');
        });
    }
}
