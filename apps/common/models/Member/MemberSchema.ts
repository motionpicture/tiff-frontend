import mongoose = require('mongoose');

/**
 * メルマガ会員スキーマ
 */
let Schema = new mongoose.Schema({
    user_id: String,
    password_salt: String,
    password_hash: String
},{
    collection: 'members',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

export default Schema;