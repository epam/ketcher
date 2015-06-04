/*global global:false*/

// TODO: add as dependency: promise-polyfill

// Use polyfill for setImmediate for performance gains
var asap = global.setImmediate || function (fn) { setTimeout(fn, 1); };

function handle(deferred) {
    var me = this;
    if (this._state === null) {
        this._deferreds.push(deferred);
        return;
    }
    asap(function () {
        var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
            (me._state ? deferred.resolve : deferred.reject)(me._value);
            return;
        }
        var ret;
        try {
            ret = cb(me._value);
        } catch (e) {
            deferred.reject(e);
            return;
        }
        deferred.resolve(ret);
    });
}

function finale() {
    for (var i = 0, len = this._deferreds.length; i < len; i++) {
        handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
}


function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchronously.
 */
function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
        fn(function (value) {
            if (done) {
                return;
            }
            done = true;
            onFulfilled(value);
        }, function (reason) {
            if (done) {
                return;
            }
            done = true;
            onRejected(reason);
        });
    } catch (ex) {
        if (done) {
            return;
        }
        done = true;
        onRejected(ex);
    }
}


function resolve(newValue) {
    try { // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === this) {
            throw new TypeError('A promise cannot be resolved with itself.');
        }
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;
            if (typeof then === 'function') {
                doResolve(then.bind(newValue), resolve.bind(this), reject.bind(this));
                return;
            }
        }
        this._state = true;
        this._value = newValue;
        finale.call(this);
    } catch (e) {
        reject.call(this, e);
    }
}

function Handler(onFulfilled, onRejected, resolveCb, rejectCb) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolveCb;
    this.reject = rejectCb;
}

function Promise(fn) {
    if (typeof this !== 'object') {
        throw new TypeError('Promises must be constructed via new');
    }
    if (typeof fn !== 'function') {
        throw new TypeError('not a function');
    }
    this._state = null;
    this._value = null;
    this._deferreds = [];

    doResolve(fn, resolve.bind(this), reject.bind(this));
}


Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
};

Promise.prototype.then = function (onFulfilled, onRejected) {
    var me = this;
    return new Promise(function (resolveCb, rejectCb) {
        handle.call(me, new Handler(onFulfilled, onRejected, resolveCb, rejectCb));
    });
};

Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolveCb, rejectCb) {
        if (args.length === 0) {
            return resolveCb([]);
        }
        var remaining = args.length;
        var result = function res(ii, value) {
            try {
                if (value && (typeof value === 'object' || typeof value === 'function')) {
                    var then = value.then;
                    if (typeof then === 'function') {
                        then.call(value, function (val) { res(ii, val); }, rejectCb);
                        return;
                    }
                }
                args[ii] = value;
                if (--remaining === 0) {
                    resolveCb(args);
                }
            } catch (ex) {
                rejectCb(ex);
            }
        };

        for (var i = 0; i < args.length; i++) {
            result(i, args[i]);
        }
    });
};

Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
    }

    return new Promise(function (resolveCb) {
        resolveCb(value);
    });
};

Promise.reject = function (value) {
    return new Promise(function (resolveCb, rejectCb) {
        rejectCb(value);
    });
};

Promise.race = function (values) {
    return new Promise(function (resolveCb, rejectCb) {
        for (var i = 0, len = values.length; i < len; i++) {
            values[i].then(resolveCb, rejectCb);
        }
    });
};

global.Promise = Promise;
