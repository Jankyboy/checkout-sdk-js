"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Observable_1 = require("rxjs/Observable");
var cart_1 = require("../cart");
var data_store_1 = require("../../data-store");
var error_1 = require("../common/error");
var actionTypes = require("./order-action-types");
var OrderActionCreator = /** @class */ (function () {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    function OrderActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
        this._cartComparator = new cart_1.CartComparator();
    }
    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    OrderActionCreator.prototype.loadOrder = function (orderId, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_ORDER_REQUESTED));
            _this._checkoutClient.loadOrder(orderId, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_ORDER_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_ORDER_FAILED, response));
            });
        });
    };
    /**
     * @param {OrderRequestBody} payload
     * @param {Cart} [cart]
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    OrderActionCreator.prototype.submitOrder = function (payload, cart, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SUBMIT_ORDER_REQUESTED));
            _this._verifyCart(cart, options)
                .then(function () { return _this._checkoutClient.submitOrder(payload, options); })
                .then(function (_a) {
                var _b = _a.body, _c = _b === void 0 ? {} : _b, data = _c.data, meta = _c.meta, _d = _a.headers, token = (_d === void 0 ? {} : _d).token;
                observer.next(data_store_1.createAction(actionTypes.SUBMIT_ORDER_SUCCEEDED, data, tslib_1.__assign({}, meta, { token: token })));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SUBMIT_ORDER_FAILED, response));
            });
        });
    };
    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    OrderActionCreator.prototype.finalizeOrder = function (orderId, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.FINALIZE_ORDER_REQUESTED));
            _this._checkoutClient.finalizeOrder(orderId, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.FINALIZE_ORDER_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.FINALIZE_ORDER_FAILED, response));
            });
        });
    };
    /**
     * @private
     * @param {Cart} [existingCart]
     * @param {RequestOptions} [options]
     * @return {Promise<boolean>}
     */
    OrderActionCreator.prototype._verifyCart = function (existingCart, options) {
        var _this = this;
        if (!existingCart) {
            return Promise.resolve(true);
        }
        return this._checkoutClient.loadCart(options)
            .then(function (_a) {
            var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
            return _this._cartComparator.isEqual(existingCart, data.cart) ? true : Promise.reject(false);
        })
            .catch(function () { return Promise.reject(error_1.createClientError('changed_cart')); });
    };
    return OrderActionCreator;
}());
exports.default = OrderActionCreator;
//# sourceMappingURL=order-action-creator.js.map