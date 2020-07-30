// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

//垃圾分类贴士
//分页模糊获取贴士信息
export const getTipsList =(params) =>{
    return getRequest('/rubbishTips/getByCondition',params)
}
//启用贴士
export const enableTips = (id,params) =>{
    return postRequest(`/rubbishTips/enableTips/${id}`,params)
}
//禁用贴士
export const disableTips =(id,params) =>{
    return postRequest(`/rubbishTips/disableTips/${id}`,params)
}
//添加贴士
export const addTips = (params) =>{
    return postRequest('/rubbishTips/save',params)
}
//编辑贴士内容
export const editTips = (params) =>{
    return putRequest('/rubbishTips/update',params)
}
//删除贴士
export const deleteTips = (ids,params) =>{
    return deleteRequest(`/rubbishTips/removeByIds/${ids}`,params)
}

//通过id获取贴士信息
export const getTipsById = (id,params) =>{
    return getRequest(`/rubbishTips/get/${id}`,params)
}
//获取所有贴士信息
export const getAllList = (params) =>{
    return getRequest('/rubbishTips/getAllList',params)
}
