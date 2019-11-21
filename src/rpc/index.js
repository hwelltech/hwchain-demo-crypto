const RpcRequest = require('./RpcRequest')
module.exports = {
    getAccountInfo: RpcRequest.accountInfo,
    getTransaction: RpcRequest.tx,
    submit: RpcRequest.submit,
    getAccountTransactions: RpcRequest.accountTx
};