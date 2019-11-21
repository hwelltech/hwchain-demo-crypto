const request = require('request-promise');
const {rpcUrl} = require('./config');

const {ChainError} = require("./RpcErrors");

async function baseRequest(method, params) {
    const rpcRequest = {
        method: method,
        params: []
    };
    rpcRequest.params.push(params ? params : {});
    const res = await request({
        uri: rpcUrl,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json"
        },
        body: rpcRequest
    });
    const result = res.result;
    if (result.status === "error") {
        throw new ChainError(JSON.stringify(result));
    } else if (result.status === "success") {
        return result;
    } else {
        throw new ChainError(JSON.stringify(result));
    }
}

function accountInfo(account) {
    return baseRequest("account_info", {
        strict: true,
        account: account
    }).then(result => {
        return result.account_data
    });
}

function accountTx(account, limit, ledgerIndexMin, ledgerIndexMax, marker) {
    return baseRequest("account_tx", {
        ledger_index_max: ledgerIndexMax ? Number(ledgerIndexMax) : -1,
        ledger_index_min: ledgerIndexMin ? Number(ledgerIndexMin) : -1,
        limit: limit ? Number(limit) : 10,
        marker: marker ? marker : undefined,
        account: account
    }).then(result => {
        return result
    });
}

function tx(hash) {
    return baseRequest("tx", {
        transaction: hash
    }).then(result => {
        return result
    });
}

function submit(txBlob) {
    return baseRequest("submit", {
        tx_blob: txBlob
    }).then(result => {
        return result
    });
}

module.exports = {
    accountInfo,
    accountTx,
    tx,
    submit
};