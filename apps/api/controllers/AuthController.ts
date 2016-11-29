import {BaseController} from './BaseController';
import {Request, Response} from "express";
import {JsonController, Req, Res, Param, Body, Get, Post, Put, Delete} from "routing-controllers";
import Models from '../../common/models/Models';
import Util from '../../common/Util/Util';
import mongoose = require("mongoose");

@JsonController()
export class AuthController extends BaseController {
    /**
     * ログイン
     */
    @Post("/api/login")
    login() {
        return new Promise((resolve, reject) => {
            let util: typeof Util = require('../../common/Util/Util').default;
            let token = util.createToken();
            Models.Authentication.findOneAndUpdate({
                mvtk_kiin_cd: '00000775' // テスト用会員コード
            },
            {
                token: token,
            },
            {
                upsert: true,
                new: true
            },
            (err, authentication) => {
                (err) ? reject(err) : resolve(authentication);
            });
        }).then((authentication: mongoose.Document) => {
            return {
                success: true,
                access_token: authentication.get('token'),
                mvtk_kiin_cd: authentication.get('mvtk_kiin_cd'), // テスト用会員コード,
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
}
