"use strict";
const BaseController_1 = require('../BaseController');
const Util_1 = require('../../../common/Util/Util');
const Models_1 = require('../../../common/models/Models');
const conf = require('config');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const fs = require('fs-extra');
let MONGOLAB_URI = conf.get('mongolab_uri');
class PreCustomerController extends BaseController_1.default {
    createCollection() {
        mongodb.MongoClient.connect(conf.get('mongolab_uri'), (err, db) => {
            let collectionName = 'pre_customers';
            this.logger.debug('dropping collection...', collectionName);
            db.collection(collectionName).drop((err) => {
                this.logger.debug('collection dropped.', collectionName, err);
                this.logger.debug('creating collection.', collectionName);
                db.createCollection(collectionName, {}, (err) => {
                    this.logger.debug('collection created.', collectionName, err);
                    db.collection(collectionName).createIndex({ user_id: 1 }, { unique: true }, (err) => {
                        this.logger.debug('index created.', err);
                        db.close();
                        process.exit(0);
                    });
                });
            });
        });
    }
    createFromJson() {
        mongoose.connect(MONGOLAB_URI, {});
        fs.readFile(`${process.cwd()}/data/${process.env.NODE_ENV}/preCustomers.json`, 'utf8', (err, data) => {
            if (err)
                throw err;
            let preCustomers = JSON.parse(data);
            // あれば更新、なければ追加
            let promises = preCustomers.map((preCustomer) => {
                // パスワードハッシュ化
                let password_salt = Util_1.default.createToken();
                preCustomer['password_salt'] = password_salt;
                preCustomer['password_hash'] = Util_1.default.createHash(preCustomer.password, password_salt);
                return new Promise((resolve, reject) => {
                    this.logger.debug('updating preCustomer...');
                    Models_1.default.PreCustomer.findOneAndUpdate({
                        user_id: preCustomer.user_id
                    }, preCustomer, {
                        new: true,
                        upsert: true
                    }, (err) => {
                        this.logger.debug('preCustomer updated', err);
                        (err) ? reject(err) : resolve();
                    });
                });
            });
            Promise.all(promises).then(() => {
                this.logger.info('promised.');
                mongoose.disconnect();
                process.exit(0);
            }, (err) => {
                this.logger.error('promised.', err);
                mongoose.disconnect();
                process.exit(0);
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PreCustomerController;