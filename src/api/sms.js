// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

// 发送一条短信
export const sendOneSms = (params) => {
    return postRequest('/sms/sendSms', params)
}

//通过id删除短信
export const delSms = (params) =>{
    return putRequest(`/sms/delSms`, params)
}

//获取所有短信记录
export const getAllSms = (params) =>{
    return getRequest(`/sms/getAllSms`,params)
}


