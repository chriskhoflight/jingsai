// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

// 添加一个订单
export const addOneOrder = (params) => {
    return postRequest('/orders/addOrder', params)
}

//获取全部订单
export const getAllOrders = (params) =>{
    return getRequest('/orders/getAllOrders',params)
}

//通过id删除订单
export const delOneOrder = (ids,params) =>{
    return deleteRequest(`/orders/delOneOrder/${ids}`, params)
}

//获取订单详情
export const getOrderDetail = (params) =>{
    return getRequest(`/orderDetails/getDetail`,params)
}
//获取在线的回收人员
export const getOnlineRp = () =>{
    return getRequest(`/orders/getAllOwnOnlineRP`)
}
//通过回收人员id和订单号手动派单
export const dispatchOrder = (params) =>{
    return putRequest(`/orders/manualDispatchOrders`,params)
}
//取消订单
export const cancelOneOrder = (params) =>{
    return putRequest(`/orders/cancelOrder`,params)
}
//手动完成订单
export const manualFinishOrder = (params) =>{
    return putRequest(`/orders/manualFinishOrder`,params)
}

//获取代办事项
export const getAlarm = () =>{
    return getRequest('/orders/getAlarm')
}



