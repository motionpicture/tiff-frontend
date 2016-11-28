import {JsonController} from "routing-controllers";
import Log4js = require('log4js');

/**
 * ベースコントローラー
 */
export class BaseController {
    /** ロガー */
    protected logger: Log4js.Logger;

    constructor() {
        // URLパラメータで言語管理
        // if (this.req.params.locale) {
        //     this.req.setLocale(req.params.locale);
        // }

        let log4js: typeof Log4js = require('log4js');
        this.logger = log4js.getLogger('system');
    }
}
