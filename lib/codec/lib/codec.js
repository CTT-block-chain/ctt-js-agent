"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = void 0;
const types_1 = require("@polkadot/types");
const create_1 = require("@polkadot/types/create");
const primitive_1 = require("@polkadot/types/primitive");
const registry = new create_1.TypeRegistry();
function processAppFinancedProposalParams(params) {
    const s = new types_1.Struct(registry, {
        account: types_1.GenericAccountId,
        appId: primitive_1.u32,
        proposalId: types_1.Bytes,
        exchange: primitive_1.u128,
        amount: primitive_1.u128,
    }, params);
    return s.toU8a();
}
function processAppFinancedUserExchangeParams(params) {
    const s = new types_1.Struct(registry, {
        account: types_1.GenericAccountId,
        appId: primitive_1.u32,
        proposalId: types_1.Bytes,
        exchangeAmount: primitive_1.u128,
    }, params);
    return s.toU8a();
}
function processAppFinancedUserExchangeConfirmParams(params) {
    const s = new types_1.Struct(registry, {
        account: types_1.GenericAccountId,
        appId: primitive_1.u32,
        payId: types_1.Bytes,
        proposalId: types_1.Bytes,
    }, params);
    return s.toU8a();
}
function processCommentDataParams(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        documentId: types_1.Bytes,
        commentId: types_1.Bytes,
        commentHash: types_1.U8aFixed,
        commentFee: primitive_1.u64,
        commentTrend: primitive_1.u8,
    }, params);
    return s.toU8a();
}
function processAddAppParams(params) {
    const s = new types_1.Struct(registry, {
        appType: types_1.Bytes,
        appName: types_1.Bytes,
        appKey: types_1.GenericAccountId,
        appAdminKey: types_1.GenericAccountId,
        returnRate: primitive_1.u32,
    }, params);
    return s.toU8a();
}
function processAuthParamsCreateModel(params) {
    const s = new types_1.Struct(registry, {
        modelId: types_1.Bytes
    }, params);
    return s.toU8a();
}
function processClientParamsCreateModel(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        expertId: types_1.Bytes,
        commodityName: types_1.Bytes,
        commodityType: primitive_1.u32,
        contentHash: types_1.U8aFixed,
    }, params);
    return s.toU8a();
}
function processClientParamsCreatePublishDoc(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        documentId: types_1.Bytes,
        modelId: types_1.Bytes,
        productId: types_1.Bytes,
        contentHash: types_1.U8aFixed,
        paraIssueRate: primitive_1.u64,
        selfIssueRate: primitive_1.u64,
    }, params);
    return s.toU8a();
}
function processClientParamsCreateIdentifyDoc(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        documentId: types_1.Bytes,
        productId: types_1.Bytes,
        contentHash: types_1.U8aFixed,
        goodsPrice: primitive_1.u64,
        identRate: primitive_1.u64,
        identConsistence: primitive_1.u64,
        sellerConsistence: primitive_1.u64,
        cartId: types_1.Bytes
    }, params);
    return s.toU8a();
}
function processClientParamsCreateTryDoc(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        documentId: types_1.Bytes,
        productId: types_1.Bytes,
        contentHash: types_1.U8aFixed,
        goodsPrice: primitive_1.u64,
        offsetRate: primitive_1.u64,
        trueRate: primitive_1.u64,
        sellerConsistence: primitive_1.u64,
        cartId: types_1.Bytes
    }, params);
    return s.toU8a();
}
function processClientParamsCreateChooseDoc(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        documentId: types_1.Bytes,
        modelId: types_1.Bytes,
        productId: types_1.Bytes,
        contentHash: types_1.U8aFixed,
        sellCount: primitive_1.u64,
        tryCount: primitive_1.u64
    }, params);
    return s.toU8a();
}
function processClientParamsCreateModelDoc(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        documentId: types_1.Bytes,
        modelId: types_1.Bytes,
        productId: types_1.Bytes,
        contentHash: types_1.U8aFixed,
        producerCount: primitive_1.u64,
        productCount: primitive_1.u64
    }, params);
    return s.toU8a();
}
function processModelExpertAddMemberParams(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        modelId: types_1.Bytes,
        kptProfitRate: primitive_1.u32,
    }, params);
    return s.toU8a();
}
function processModelExpertDelMemberParams(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        modelId: types_1.Bytes,
        member: types_1.GenericAccountId,
    }, params);
    return s.toU8a();
}
function processModelIncomeCollectingParam(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        modelIds: 'Vec<Bytes>',
        incomes: 'Vec<u64>',
    }, params);
    return s.toU8a();
}
function processAppKeyManageParams(params) {
    const s = new types_1.Struct(registry, {
        admin: types_1.GenericAccountId,
        appId: primitive_1.u32,
        member: types_1.GenericAccountId
    }, params);
    return s.toU8a();
}
function processAppIncomeRedeemParams(params) {
    const s = new types_1.Struct(registry, {
        account: types_1.GenericAccountId,
        appId: primitive_1.u32,
        cycle: primitive_1.u32,
        exchangeAmount: primitive_1.u128
    }, params);
    return s.toU8a();
}
function processAppIncomeRedeemConfirmParams(params) {
    const s = new types_1.Struct(registry, {
        account: types_1.GenericAccountId,
        appId: primitive_1.u32,
        payId: types_1.Bytes,
        cycle: primitive_1.u32
    }, params);
    return s.toU8a();
}
function processModelKeyParams(params) {
    const s = new types_1.Struct(registry, {
        appId: primitive_1.u32,
        modelId: types_1.Bytes,
    }, params);
    return s.toU8a();
}
function processFinanceMemberParams(params) {
    const s = new types_1.Struct(registry, {
        deposit: primitive_1.u128,
        member: types_1.GenericAccountId,
    }, params);
    return s.toU8a();
}
const encode = (structType, structObj) => {
    switch (structType) {
        case 'AppFinancedProposalParams':
            return processAppFinancedProposalParams(structObj);
        case 'AppFinancedUserExchangeParams':
            return processAppFinancedUserExchangeParams(structObj);
        case 'AppFinancedUserExchangeConfirmParams':
            return processAppFinancedUserExchangeConfirmParams(structObj);
        case 'CommentData':
            return processCommentDataParams(structObj);
        case 'AddAppParams':
            return processAddAppParams(structObj);
        case 'AuthParamsCreateModel':
            return processAuthParamsCreateModel(structObj);
        case 'ClientParamsCreateModel':
            return processClientParamsCreateModel(structObj);
        case 'ClientParamsCreatePublishDoc':
            return processClientParamsCreatePublishDoc(structObj);
        case 'ClientParamsCreateIdentifyDoc':
            return processClientParamsCreateIdentifyDoc(structObj);
        case 'ClientParamsCreateTryDoc':
            return processClientParamsCreateTryDoc(structObj);
        case 'ClientParamsCreateChooseDoc':
            return processClientParamsCreateChooseDoc(structObj);
        case 'ClientParamsCreateModelDoc':
            return processClientParamsCreateModelDoc(structObj);
        case 'ModelExpertAddMemberParams':
            return processModelExpertAddMemberParams(structObj);
        case 'ModelExpertDelMemberParams':
            return processModelExpertDelMemberParams(structObj);
        case 'ModelIncomeCollectingParam':
            return processModelIncomeCollectingParam(structObj);
        case 'AppKeyManageParams':
            return processAppKeyManageParams(structObj);
        case 'AppIncomeRedeemParams':
            return processAppIncomeRedeemParams(structObj);
        case 'AppIncomeRedeemConfirmParams':
            return processAppIncomeRedeemConfirmParams(structObj);
        case 'ModelKeyParams':
            return processModelKeyParams(structObj);
        case 'FinanceMemberParams':
            return processFinanceMemberParams(structObj);
        default:
            return null;
    }
};
exports.encode = encode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvZGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUE0RTtBQUM1RSxtREFBc0Q7QUFDdEQseURBQStEO0FBRS9ELE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQVksRUFBRSxDQUFDO0FBRXBDLFNBQVMsZ0NBQWdDLENBQUMsTUFBVztJQUNuRCxNQUFNLENBQUMsR0FBRyxJQUFJLGNBQU0sQ0FBQyxRQUFRLEVBQUU7UUFDN0IsT0FBTyxFQUFFLHdCQUFnQjtRQUN6QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLFFBQVEsRUFBRSxnQkFBSTtRQUNkLE1BQU0sRUFBRSxnQkFBSTtLQUNiLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxvQ0FBb0MsQ0FBQyxNQUFXO0lBQ3ZELE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixPQUFPLEVBQUUsd0JBQWdCO1FBQ3pCLEtBQUssRUFBRSxlQUFHO1FBQ1YsVUFBVSxFQUFFLGFBQUs7UUFDakIsY0FBYyxFQUFFLGdCQUFJO0tBQ3JCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUywyQ0FBMkMsQ0FBQyxNQUFXO0lBQzlELE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixPQUFPLEVBQUUsd0JBQWdCO1FBQzNCLEtBQUssRUFBRSxlQUFHO1FBQ1YsS0FBSyxFQUFFLGFBQUs7UUFDWixVQUFVLEVBQUUsYUFBSztLQUNoQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRVgsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkIs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