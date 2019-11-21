const util = require('util');

function extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        cls.apply(this, arguments);
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype);
    return ExtendableBuiltin;
}

class APIError extends extendableBuiltin(Error) {
    constructor(message, type) {
        super(message);

        this.name = this.constructor.name;
        this.type = type || this.constructor.name;
        this.message = message;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor.name);
        }
    }

    toString() {
        let result = '[' + this.name + '(' + this.message;
        if (this.data) {
            result += ', ' + util.inspect(this.data);
        }
        result += ')]';
        return result;
    }

    inspect() {
        return this.toString();
    }
}

class ChainError extends APIError {
}

module.exports = {
    APIError,
    ChainError
};
