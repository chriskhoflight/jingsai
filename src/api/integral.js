// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

// 获取积分数据 多条件
export const getIntegralList = (params) => {
    return getRequest('/integrals/getIntegralList', params)
}
// 获取积分明细数据 多条件
export const getIntegralDetailsList = (params) => {
    return getRequest('/integralDetails/getIntegralDetailsList', params)
}
// 获取积分充值明细数据 多条件
export const getIntegralRechargeDetailsList = (params) => {
    return getRequest('/integralRecharge/getIntegralRechargeDetailsList', params)
}
// 获取积分提现明细数据 多条件
export const getIntegralWithdrawalDetailsList = (params) => {
    return getRequest('/integralWithdrawal/getIntegralWithdrawalDetailsList', params)
}


// 积分提现成功
// export const integralWithdrawalVeryfyPassed = (id, params) => {
//     return postRequest(`/integralWithdrawal/integralWithdrawalVeryfyPassed/${id}`, params)
// }
export const integralWithdrawalVeryfyPassed = (params) => {
    return postRequest('/integralWithdrawal/integralWithdrawalVeryfyPassed', params)
}

// 编辑积分-提现审核不通过把积分加回去
export const integralWithdrawalVeryfyNotPassed = (params) => {
    return postRequest('/integralWithdrawal/integralWithdrawalVeryfyNotPassed', params)
}
// 提现明细页面-通过
export const integralDetailVeryfyPassed = (params) => {
    return postRequest('/integralWithdrawal/integralDetailVeryfyPassed', params)
}
// 提现明细页面-不通过
export const integralDetailVeryfyNotPassed = (params) => {
    return postRequest('/integralWithdrawal/integralDetailVeryfyNotPassed', params)
}
// 提现明细页面-批量审核通过
export const detailbatchPassed = (ids, params) => {
    return postRequest(`/integralWithdrawal/detailbatchPassed/${ids}`, params)
}

// 提现明细页面-批量审核不通过
export const detailbatchNotPassed = (ids, params) => {
    return postRequest(`/integralWithdrawal/detailbatchNotPassed/${ids}`, params)
}

// 获取积分提现管理数据 多条件
export const getIntegralWithdrawalList = (params) => {
    return getRequest('/integralWithdrawal/getIntegralWithdrawalList', params)
}

// 批量审核通过
export const batchPassed = (ids, params) => {
    return postRequest(`/integralWithdrawal/batchPassed/${ids}`, params)
}

// 批量审核不通过
export const batchNotPassed = (ids, params) => {
    return postRequest(`/integralWithdrawal/batchNotPassed/${ids}`, params)
}

// 手动转账
export const handPaied = (ids) => {
    return postRequest(`/integralWithdrawal/handPaied/${ids}`)
}