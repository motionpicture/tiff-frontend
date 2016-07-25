"use strict";
var mongoose = require('mongoose');
/**
 * スクリーンスキーマ
 */
var ScreenSchema = new mongoose.Schema({
    theater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater'
    },
    name: String,
    name_en: String,
    sections: [
        {
            _id: false,
            code: String,
            name: String,
            name_en: String,
            seats: [
                {
                    _id: false,
                    code: String,
                    enabled: Boolean,
                },
            ]
        },
    ],
    created_user: String,
    updated_user: String,
}, {
    collection: 'screens',
    timestamps: {
        createdAt: 'created_dt',
        updatedAt: 'updated_dt',
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScreenSchema;