const API = require('./hwchain-crypto/npm');
const RPC = require('./rpc');

/**
 * 离线生成账户
 * @param {*} secret 密钥
 */
function generateAddress(secret) {
    return secret ? API.generateAddress(secret).wallet : API.generateAddress().wallet;
}

/**
 * 查询账户信息
 * @param {*} address 账户
 */
async function getAccountInfo(address) {
    const res = {
        success: "success",
        message: "success",
        data: {}
    };
    try {
        const data = await RPC.getAccountInfo(address);
        res.data = data
    } catch (err) {
        res.success = "error";
        res.message = err.message
    }
    return res
}

/**
 * 查询账户交易记录
 * @param {*} address 账户
 * @param {*} limit 显示条数
 * @param {*} ledgerIndexMin 最小区块
 * @param {*} ledgerIndexMax 最大区块
 * @param {*} marker 下一页参数
 */
async function getAccountTransactions(address, limit, ledgerIndexMin, ledgerIndexMax, marker) {
    const res = {
        success: "success",
        message: "success",
        data: {}
    };
    try {
        const data = await RPC.getAccountTransactions(address, limit, ledgerIndexMin, ledgerIndexMax, marker);
        res.data = data
    } catch (err) {
        res.success = "error";
        res.message = err.message
    }
    return res
}

/**
 * 查询交易详情
 * @param {*} hash 交易hash
 */
async function getTransaction(hash) {
    const res = {
        success: "success",
        message: "success",
        data: {}
    };
    try {
        const data = await RPC.getTransaction(hash);
        res.data = data
    } catch (err) {
        res.success = "error";
        res.message = err.message
    }
    return res
}

/**
 * 转账HWT [离线签名]
 * @param {*} address 发起账户
 * @param {*} secret 发起账户密钥
 * @param {*} destination 对方账户
 * @param {*} amount 数量
 * @param {*} memoType 备注类型
 * @param {*} memoData 备注内容
 */
async function paymentSignBase(address, secret, destination, amount, memoType, memoData) {
    const res = {
        success: "success",
        message: "success",
        data: {}
    }
    try {
        //获取Sequence
        const data = await RPC.getAccountInfo(address);
        const txJson = {
            "TransactionType": "Payment",
            "Account": address,
            "Destination": destination,
            "Amount": API.base.baseToDrops(amount),
            "Fee": "10000",
            "Sequence": data.Sequence
        };
        if (memoType && memoData) {
            const memos = [
                {
                    Memo: {
                        MemoType: API.base.utils.convertStringToHex(memoType),
                        MemoData: API.base.utils.convertStringToHex(memoData)
                    }
                }
            ];
            txJson["Memos"] = memos
        }
        // 交易签名
        const resSign = API.sign(txJson, secret);
        res.data = resSign
    } catch (err) {
        res.success = "error";
        res.message = err.message
    }
    return res
}

/**
 * 转账二级资产 [离线签名]
 * @param {*} address 发起账户
 * @param {*} secret 发起账户密钥
 * @param {*} destination 对方账户
 * @param {*} amount 数量
 * @param {*} currency 资产名称
 * @param {*} issuer 资产发行方
 * @param {*} memoType 备注类型
 * @param {*} memoData 备注内容
 */
async function paymentSignToken(address, secret, destination, amount, currency, issuer, memoType, memoData) {
    const res = {
        success: "success",
        message: "success",
        data: {}
    }
    try {
        //获取Sequence
        const data = await RPC.getAccountInfo(address);
        const txJson = {
            "TransactionType": "Payment",
            "Account": address,
            "Destination": destination,
            "Amount": {
                "value": amount,
                "currency": currency,
                "issuer": issuer
            },
            "Fee": "10000",
            "Sequence": data.Sequence
        };
        if (memoType && memoData) {
            const memos = [
                {
                    Memo: {
                        MemoType: API.base.utils.convertStringToHex(memoType),
                        MemoData: API.base.utils.convertStringToHex(memoData)
                    }
                }
            ];
            txJson["Memos"] = memos
        }
        // 交易签名
        const resSign = API.sign(txJson, secret);
        res.data = resSign
    } catch (err) {
        res.success = "error";
        res.message = err.message
    }
    return res
}

/**
 * 提交交易
 * @param {*} txBlob 交易内容（HEX）
 */
async function submit(txBlob) {
    const res = {
        success: "success",
        message: "success",
        data: {}
    };
    try {
        const data = await RPC.submit(txBlob);
        res.data = data
    } catch (err) {
        res.success = "error";
        res.message = err.message
    }
    return res
}

/**
 * 转账HWT
 * @param {*} address 发起账户
 * @param {*} secret 发起账户密钥
 * @param {*} destination 对方账户
 * @param {*} amount 数量
 * @param {*} memoType 备注类型
 * @param {*} memoData 备注内容
 */
async function paymentBase(address, secret, destination, amount, memoType, memoData) {
    const resSign = await paymentSignBase(address, secret, destination, amount, memoType, memoData);
    console.log("HWT签名结果:" + JSON.stringify(resSign));
    if (resSign.success === "success") {
        console.log("hash  : " + resSign.data.hash);
        console.log("txBlob: " + resSign.data.signedTransaction);
        const resSubmit = await submit(resSign.data.signedTransaction);
        return resSubmit;
    } else {
        const res = {
            success: "error",
            message: "sign error",
            data: resSign.data
        };
        return res
    }
}

/**
 * 转账二级资产
 * @param {*} address 发起账户
 * @param {*} secret 发起账户密钥
 * @param {*} destination 对方账户
 * @param {*} amount 数量
 * @param {*} currency 资产名称
 * @param {*} issuer 资产发行方
 * @param {*} memoType 备注类型
 * @param {*} memoData 备注内容
 */
async function paymentToken(address, secret, destination, amount, currency, issuer, memoType, memoData) {
    const resSign = await paymentSignToken(address, secret, destination, amount, currency, issuer, memoType, memoData);
    console.log("二级资产签名结果:" + JSON.stringify(resSign));
    if (resSign.success === "success") {
        console.log("hash  : " + resSign.data.hash);
        console.log("txBlob: " + resSign.data.signedTransaction);
        const resSubmit = await submit(resSign.data.signedTransaction);
        return resSubmit;
    } else {
        const res = {
            success: "error",
            message: "sign error",
            data: resSign.data
        };
        return res
    }
}

async function index() {
    //1. 离线生成账户
    console.log("离线生成账户");
    const wallet = generateAddress();
    console.log(JSON.stringify(wallet) + "\n");
    //1.1 根据密钥获取账户
    console.log("根据密钥获取账户");
    const wallet1 = generateAddress(wallet.secret);
    console.log(JSON.stringify(wallet1));
    console.log("valid: " + API.isValidAddress(wallet.address).wallet + "\n");


    // 2. 查询账户信息
    const address = "hEnGSrKKdo1K5cWQWJsERKSe4orVS5r4ML";
    const secret = "sp5K61QzpxvbPzQ2QmbZwKGf16SoL";
    console.log("查询账户信息");
    const resAccountInfo = await getAccountInfo(address);
    console.log("账户:" + address);
    console.log("信息:" + JSON.stringify(resAccountInfo) + "\n");

    // 3. 查询账户交易记录
    console.log("查询账户交易记录");
    const limit = 2;
    const resAccountTransactions = await getAccountTransactions(address, limit);
    console.log("账户:" + address);
    console.log("交易记录:" + JSON.stringify(resAccountTransactions) + "\n");

    // 4. 查询交易详情
    console.log("查询交易详情");
    const hash = "DABCB49CA7AC432FF3FDB85A3C6CB5F85F6D122B598A5D652E9DAC16A3334768";
    const resTransaction = await getTransaction(hash);
    console.log("交易hash:" + hash);
    console.log("交易详情:" + JSON.stringify(resTransaction) + "\n");

    // 5. 转账HWT [离线签名]
    console.log("转账HWT");
    let memoType = "TEXT";
    let memoData = "hello";
    const hwtAmount = 1.1;
    const destination = "hJjS8CTpWv43EkmePrQ34DbmPD1gfptej6";
    const resPaymentBase = await paymentBase(address, secret, destination, hwtAmount, memoType, memoData);
    console.log("交易结果:" + JSON.stringify(resPaymentBase) + "\n");

    // 6. 转账二级资产 [离线签名]
    console.log("转账二级资产");
    const paymentTokenAddress = "hLS5GhuGAV11oxz2DW9sZmR12k92TqrNvk";
    const paymentTokenSecret = "snC5gLVn1gwkmMhUEbw8ywqK1vKEd";
    const tokenAmount = 1.1;
    const tokenName = "TOPOT";
    const tokenIssuer = "hw9PJJZJKPvxoaKNf7DM3F5DHLQSLawfJs";
    const resPaymentToken = await paymentToken(paymentTokenAddress, paymentTokenSecret, destination, tokenAmount, tokenName, tokenIssuer, memoType, memoData);
    console.log("交易结果:" + JSON.stringify(resPaymentToken) + "\n");
}


index().then(result => {
});

