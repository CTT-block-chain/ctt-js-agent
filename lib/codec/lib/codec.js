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
const encode = (structType, structObj) => {
    switch (structType) {
        case 'AppFinancedProposalParams':
            return processAppFinancedProposalParams(structObj);
        case 'CommentData':
            return processCommentDataParams(structObj);
        default:
            return null;
            break;
    }
};
exports.encode = encode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvZGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUE0RTtBQUM1RSxtREFBc0Q7QUFDdEQseURBQStEO0FBRS9ELE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQVksRUFBRSxDQUFDO0FBRXBDLFNBQVMsZ0NBQWdDLENBQUMsTUFBVztJQUNuRCxNQUFNLENBQUMsR0FBRyxJQUFJLGNBQU0sQ0FBQyxRQUFRLEVBQUU7UUFDN0IsT0FBTyxFQUFFLHdCQUFnQjtRQUN6QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLFFBQVEsRUFBRSxnQkFBSTtRQUNkLE1BQU0sRUFBRSxnQkFBSTtLQUNiLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxNQUFXO0lBQzNDLE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTSxDQUFDLFFBQVEsRUFBRTtRQUM3QixLQUFLLEVBQUUsZUFBRztRQUNWLFVBQVUsRUFBRSxhQUFLO1FBQ2pCLFNBQVMsRUFBRSxhQUFLO1FBQ2hCLFdBQVcsRUFBRSxnQkFBUTtRQUNyQixVQUFVLEVBQUUsZUFBRztRQUNmLFlBQVksRUFBRSxjQUFFO0tBQ2pCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFWCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRU0sTUFBTSxNQUFNLEdBQUcsQ0FBQyxVQUFrQixFQUFFLFNBQWMsRUFBYyxFQUFFO0lBQ3ZFLFFBQVEsVUFBVSxFQUFFO1FBQ2xCLEtBQUssMkJBQTJCO1lBQzlCLE9BQU8sZ0NBQWdDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckQsS0FBSyxhQUFhO1lBQ2hCLE9BQU8sd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0M7WUFDRSxPQUFPLElBQUksQ0FBQztZQUNaLE1BQU07S0FDVDtBQUNILENBQUMsQ0FBQTtBQVZZLFFBQUEsTUFBTSxVQVVsQiJ9