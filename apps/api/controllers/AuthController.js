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
const BaseController_1 = require('./BaseController');
const routing_controllers_1 = require("routing-controllers");
const MongooseModels_1 = require('../../common/models/MongooseModels');
let AuthController = class AuthController extends BaseController_1.BaseController {
    /**
     * ログイン
     */
    login() {
        return new Promise((resolve, reject) => {
            let util = require('../../common/Util/Util').default;
            let token = util.createToken();
            MongooseModels_1.AuthenticationModel.findOneAndUpdate({
                mvtk_kiin_cd: '00000775' // テスト用会員コード
            }, {
                token: token,
            }, {
                upsert: true,
                new: true
            }, (err, authentication) => {
                (err) ? reject(err) : resolve(authentication);
            });
        }).then((authentication) => {
            return {
                success: true,
                access_token: authentication.get('token'),
                mvtk_kiin_cd: authentication.get('mvtk_kiin_cd'),
                message: null
            };
        }, (err) => {
            return {
                success: false,
                access_token: null,
                mvtk_kiin_cd: null,
                message: err.message
            };
        });
    }
};
__decorate([
    routing_controllers_1.Post("/api/login"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', void 0)
], AuthController.prototype, "login", null);
AuthController = __decorate([
    routing_controllers_1.JsonController(), 
    __metadata('design:paramtypes', [])
], AuthController);
exports.AuthController = AuthController;
