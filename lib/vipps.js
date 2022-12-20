"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VippsEcommerce = exports.Vipps = void 0;
const axios_1 = require("axios");
const dotenv = require('dotenv');
dotenv.config();
class Vipps {
    constructor({ subscriptionKey, authToken }) {
        this.SUBSCRIPTION_KEY = subscriptionKey || process.env.VIPPS_SUBSCRIPTION_KEY;
        this.accessToken = authToken;
    }
    authenticate({ clientId, clientSecret, subscriptionKey }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientId || !clientSecret || !subscriptionKey) {
                try {
                    clientId = process.env.VIPPS_CLIENT_ID;
                    clientSecret = process.env.VIPPS_CLIENT_SECRET;
                    subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
                }
                catch (error) {
                    throw new Error('Missing credentials. Provide clientId, clientSecret and subscriptionKey, or set them as environment variables.');
                }
            }
            return yield axios_1.default
                .post('/accessToken/get', {}, {
                baseURL: process.env.VIPPS_API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    client_id: clientId,
                    client_secret: clientSecret,
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                },
            })
                .then((response) => {
                this.accessToken = response.data.access_token;
                return response.data.access_token;
            });
        });
    }
    setMsn(merchantSerialNumber) {
        this.merchantSerialNumber = merchantSerialNumber;
    }
    get msn() {
        return this.merchantSerialNumber;
    }
    get api() {
        if (!this.accessToken) {
            throw new Error('No access token. Call getAccessToken first.');
        }
        return axios_1.default.create({
            baseURL: process.env.VIPPS_API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY,
                Authorization: `Bearer ${this.accessToken}`,
                'Merchant-Serial-Number': this.merchantSerialNumber,
                'Vipps-System-Name': process.env.VIPPS_SYSTEM_NAME || 'gait-vipps',
            },
        });
    }
    get token() {
        return this.accessToken;
    }
}
exports.Vipps = Vipps;
class VippsEcommerce extends Vipps {
    constructor(options, merchantSerialNumber) {
        super(options);
        if (merchantSerialNumber) {
            this.setMsn(merchantSerialNumber);
        }
    }
    setOptions(_b) {
        var options = __rest(_b, []);
        this.callbackPrefix = options.callbackPrefix;
        this.consentRemovalPrefix = options.consentRemovalPrefix;
        this.fallBack = options.fallback;
        this.setMsn(options.merchantSerialNumber);
    }
    expressOrder(order) {
        return new Promise((resolve, reject) => {
            this.api
                .post('/ecomm/v2/payments', {
                merchantInfo: {
                    callbackPrefix: this.callbackPrefix,
                    consentRemovalPrefix: this.consentRemovalPrefix,
                    fallBack: this.fallBack,
                    merchantSerialNumber: this.msn,
                    paymentType: order.merchantInfo.paymentType,
                    shippingDetailsPrefix: order.merchantInfo.shippingDetailsPrefix,
                    staticShippingDetails: order.merchantInfo.staticShippingDetails,
                },
                customerInfo: {
                    mobileNumber: order.customerInfo.mobileNumber,
                },
                transaction: {
                    amount: order.transaction.amount,
                    orderId: order.transaction.orderId,
                    transactionText: order.transaction.transactionText,
                    useExplicitCheckoutFlow: order.transaction.useExplicitCheckoutFlow,
                },
            })
                .then((response) => {
                resolve(response.data);
            })
                .catch((error) => {
                reject(error.response.data);
            });
        });
    }
    getOrderDetails(orderId) {
        return new Promise((resolve, reject) => {
            this.api
                .get(`/ecomm/v2/payments/${orderId}/details`)
                .then((response) => {
                resolve(response.data);
            })
                .catch((error) => {
                reject(error.response.data);
            });
        });
    }
    captureOrder(captureOrderProps) {
        return new Promise((resolve, reject) => {
            this.api
                .post(`/ecomm/v2/payments/${captureOrderProps.orderId}/capture`, {
                merchantInfo: {
                    merchantSerialNumber: this.msn,
                },
                transaction: {
                    transactionText: captureOrderProps.transactionText,
                },
            }, {
                headers: {
                    'X-Request-Id': captureOrderProps.orderId,
                },
            })
                .then((response) => {
                resolve(response.data);
            })
                .catch((error) => {
                reject(error.response.data);
            });
        });
    }
}
exports.VippsEcommerce = VippsEcommerce;
_a = VippsEcommerce;
VippsEcommerce.getInstance = (MSN) => __awaiter(void 0, void 0, void 0, function* () {
    if (!VippsEcommerce.instance) {
        VippsEcommerce.instance = new VippsEcommerce({});
        if (MSN) {
            VippsEcommerce.instance.setMsn(MSN);
        }
        yield VippsEcommerce.instance.authenticate({});
    }
    return VippsEcommerce.instance;
});
