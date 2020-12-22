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
const encode = (structType, structObj) => {
    switch (structType) {
        case 'AppFinancedProposalParams':
            return processAppFinancedProposalParams(structObj);
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
        default:
            return null;
    }
};
exports.encode = encode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvZGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUE0RTtBQUM1RSxtREFBc0Q7QUFDdEQseURBQStEO0FBRS9ELE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQVksRUFBRSxDQUFDO0FBRXBDLFNBQVMsZ0NBQWdDLENBQUMsTUFBVztJQUNuRCxNQUFNLENBQUMsR0FBRyxJQUFJLGNBQU0sQ0FBQyxRQUFRLEVBQUU7UUFDN0IsT0FBTyxFQUFFLHdCQUFnQjtRQUN6QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLFFBQVEsRUFBRSxnQkFBSTtRQUNkLE1BQU0sRUFBRSxnQkFBSTtLQUNiLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxNQUFXO0lBQzNDLE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLFNBQVMsRUFBRSxhQUFLO1FBQ2hCLFdBQVcsRUFBRSxnQkFBUTtRQUNyQixVQUFVLEVBQUUsZUFBRztRQUNmLFlBQVksRUFBRSxjQUFFO0tBQ2pCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxNQUFXO0lBQ3RDLE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixPQUFPLEVBQUUsYUFBSztRQUNkLE9BQU8sRUFBRSxhQUFLO1FBQ2QsTUFBTSxFQUFFLHdCQUFnQjtRQUN4QixXQUFXLEVBQUUsd0JBQWdCO1FBQzdCLFVBQVUsRUFBRSxlQUFHO0tBQ2hCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyw0QkFBNEIsQ0FBQyxNQUFXO0lBQy9DLE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixPQUFPLEVBQUUsYUFBSztLQUNmLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyw4QkFBOEIsQ0FBQyxNQUFXO0lBQ2pELE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixLQUFLLEVBQUUsZUFBRztRQUNWLFFBQVEsRUFBRSxhQUFLO1FBQ2YsYUFBYSxFQUFFLGFBQUs7UUFDcEIsYUFBYSxFQUFFLGVBQUc7UUFDbEIsV0FBVyxFQUFFLGdCQUFRO0tBQ3RCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxtQ0FBbUMsQ0FBQyxNQUFXO0lBQ3RELE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLE9BQU8sRUFBRSxhQUFLO1FBQ2QsU0FBUyxFQUFFLGFBQUs7UUFDaEIsV0FBVyxFQUFFLGdCQUFRO1FBQ3JCLGFBQWEsRUFBRSxlQUFHO1FBQ2xCLGFBQWEsRUFBRSxlQUFHO0tBQ25CLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxvQ0FBb0MsQ0FBQyxNQUFXO0lBQ3ZELE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLFNBQVMsRUFBRSxhQUFLO1FBQ2hCLFdBQVcsRUFBRSxnQkFBUTtRQUNyQixVQUFVLEVBQUUsZUFBRztRQUNmLFNBQVMsRUFBRSxlQUFHO1FBQ2QsZ0JBQWdCLEVBQUUsZUFBRztRQUNyQixNQUFNLEVBQUUsYUFBSztLQUNkLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUywrQkFBK0IsQ0FBQyxNQUFXO0lBQ2xELE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLFNBQVMsRUFBRSxhQUFLO1FBQ2hCLFdBQVcsRUFBRSxnQkFBUTtRQUNyQixVQUFVLEVBQUUsZUFBRztRQUNmLFVBQVUsRUFBRSxlQUFHO1FBQ2YsUUFBUSxFQUFFLGVBQUc7UUFDYixNQUFNLEVBQUUsYUFBSztLQUNkLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxNQUFXO0lBQ3JELE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLE9BQU8sRUFBRSxhQUFLO1FBQ2QsU0FBUyxFQUFFLGFBQUs7UUFDaEIsV0FBVyxFQUFFLGdCQUFRO1FBQ3JCLFNBQVMsRUFBRSxlQUFHO1FBQ2QsUUFBUSxFQUFFLGVBQUc7S0FDZCxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRVgsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELFNBQVMsaUNBQWlDLENBQUMsTUFBVztJQUNwRCxNQUFNLENBQUMsR0FBRyxJQUFJLGNBQU0sQ0FBQyxRQUFRLEVBQUU7UUFDN0IsS0FBSyxFQUFFLGVBQUc7UUFDVixVQUFVLEVBQUUsYUFBSztRQUNqQixPQUFPLEVBQUUsYUFBSztRQUNkLFNBQVMsRUFBRSxhQUFLO1FBQ2hCLFdBQVcsRUFBRSxnQkFBUTtRQUNyQixhQUFhLEVBQUUsZUFBRztRQUNsQixZQUFZLEVBQUUsZUFBRztLQUNsQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRVgsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVNLE1BQU0sTUFBTSxHQUFHLENBQUMsVUFBa0IsRUFBRSxTQUFjLEVBQWMsRUFBRTtJQUN2RSxRQUFRLFVBQVUsRUFBRTtRQUNsQixLQUFLLDJCQUEyQjtZQUM5QixPQUFPLGdDQUFnQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JELEtBQUssYUFBYTtZQUNoQixPQUFPLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLEtBQUssY0FBYztZQUNqQixPQUFPLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLEtBQUssdUJBQXVCO1lBQzFCLE9BQU8sNEJBQTRCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsS0FBSyx5QkFBeUI7WUFDNUIsT0FBTyw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxLQUFLLDhCQUE4QjtZQUNqQyxPQUFPLG1DQUFtQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELEtBQUssK0JBQStCO1lBQ2xDLE9BQU8sb0NBQW9DLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekQsS0FBSywwQkFBMEI7WUFDN0IsT0FBTywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxLQUFLLDZCQUE2QjtZQUNoQyxPQUFPLGtDQUFrQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELEtBQUssNEJBQTRCO1lBQy9CLE9BQU8saUNBQWlDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQ7WUFDRSxPQUFPLElBQUksQ0FBQztLQUNmO0FBQ0gsQ0FBQyxDQUFBO0FBekJZLFFBQUEsTUFBTSxVQXlCbEIifQ==