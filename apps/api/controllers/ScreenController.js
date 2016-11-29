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
const MongooseModels_1 = require('../../common/models/MongooseModels');
let ScreenController = class ScreenController extends BaseController_1.BaseController {
    /**
     * スクリーンの座席マップを生成する
     */
    show(id) {
        // スクリーンを取得
        return MongooseModels_1.ScreenModel.count({ _id: id }).then((count) => {
            if (count === 0)
                return 'false';
            // スクリーン座席表HTMLを出力
            let fs = require('fs-extra');
            return fs.readFileSync(`${__dirname}/../../common/views/screens/${id}.ejs`, 'utf8');
        });
    }
};
__decorate([
    routing_controllers_1.Get("/api/screen/:id/show"),
    routing_controllers_1.ContentType("text/plain"),
    __param(0, routing_controllers_1.Param("id")), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [String]), 
    __metadata('design:returntype', void 0)
], ScreenController.prototype, "show", null);
ScreenController = __decorate([
    routing_controllers_1.Controller(), 
    __metadata('design:paramtypes', [])
], ScreenController);
exports.ScreenController = ScreenController;
