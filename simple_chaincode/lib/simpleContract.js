'use strict';

const { Contract } = require('fabric-contract-api');

class SimpleContract extends Contract {

    async put(ctx, objType, key, value) {
        const compositeKey = this._createCompositeKey(ctx, objType, key);
        console.log("put compositeKey :", compositeKey);
        await ctx.stub.putState(compositeKey, Buffer.from(value));
    }

    async get(ctx, objType, key) {
        const compositeKey = this._createCompositeKey(ctx, objType, key);
        const value = await ctx.stub.getState(compositeKey);
        console.log("put value :", value);
        if (!value || value.length === 0) {
            throw new Error(`The asset ${key} of type ${objType} does not exist`);
        }

        return value.toString();
    }

    async del(ctx, objType, key) {
        const compositeKey = this._createCompositeKey(ctx, objType, key);
        console.log("del compositeKey :", compositeKey);
        await ctx.stub.deleteState(compositeKey);
    }
    
    async getByRange(ctx, keyFrom, keyTo) {
        const iteratorPromise = ctx.stub.getStateByRange(keyFrom, keyTo);
        console.log("getByRangel iteratorPromise :", iteratorPromise);
        
        let results = [];
        for await (const res of iteratorPromise) {
            results.push({
                key:   res.key,
                value: res.value.toString()
            });
        }

        console.log("getByRangel results :", JSON.stringify(results));

        return JSON.stringify(results);
    }

    async getByType(ctx, objType) {
        const iteratorPromise = ctx.stub.getStateByPartialCompositeKey(objType, []);
        console.log("getByType iteratorPromise :", iteratorPromise);
        
        let results = [];
        for await (const res of iteratorPromise) {
            const splitKey = ctx.stub.splitCompositeKey(res.key);
            results.push({
                objType: splitKey.objectType,
                key:     splitKey.attributes[0],
                value:   res.value.toString()
            });
        }

        console.log("getByType results :", JSON.stringify(results));

        return JSON.stringify(results);
    }

    _createCompositeKey(ctx, objType, key) {
        if (!key || key === "") {
            throw new Error(`A key should be a non-empty string`);
        }

        if (objType === "") {
            return key;
        }

        return ctx.stub.createCompositeKey(objType, [key]);
    }
}

module.exports = SimpleContract;