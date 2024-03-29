"use strict";
const CustomerCancelController_1 = require('../controllers/Customer/Cancel/CustomerCancelController');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    let base = (req, res, next) => {
        next();
    };
    app.all('/customerSupport/cancel', 'customer.cancel', base, (req, res, next) => { (new CustomerCancelController_1.default(req, res, next)).index(); });
    app.post('/customerSupport/cancel/executeByPaymentNo', 'customer.cancel.executeByPaymentNo', base, (req, res, next) => { (new CustomerCancelController_1.default(req, res, next)).executeByPaymentNo(); });
};
