"use strict";
/**
 * ベースコントローラー
 */
class BaseController {
    constructor() {
        // URLパラメータで言語管理
        // if (this.req.params.locale) {
        //     this.req.setLocale(req.params.locale);
        // }
        let log4js = require('log4js');
        this.logger = log4js.getLogger('system');
    }
}
exports.BaseController = BaseController;
