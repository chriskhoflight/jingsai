// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

//分页模糊获取回收人员信息
export const getAllRecyclingPerson =(params) =>{
    return getRequest('/recyclingPersonnel/getByCondition',params)
}
//添加回收人员
export const addPerson = (params) =>{
    return postRequest('/recyclingPersonnel/addPersonToRedis',params)
}
//编辑回收人员信息
export const editPerson = (params) =>{
    return putRequest('/recyclingPersonnel/editPersonToRedis',params)
}
//删除回收人员信息
export const deletePerson = (ids,params) =>{
    return deleteRequest(`/recyclingPersonnel/removeByIdsTwo/${ids}`,params)
}
//查询是否有此回收人员
export const selectByPhone = (params) =>{
    return getRequest('/recyclingPersonnel/getByPhone',params)
}
//分页模糊查询普通人户
export const getAllWechatUser =(params) =>{
    return getRequest('/wechatUser/getWechatUser',params)
}
//编辑普通用户
export const editWechatUser =(params) =>{
    return putRequest('/wechatUser/editWechatUser',params)
}
//验证手机号是否存在
export const getByPhoneNum =(params) =>{
    return getRequest('/wechatUser/selectByPhoneAndClientType',params)
}
//分页模糊查询待审核的回收人员
export const getVerifyPerson =(params) =>{
    return getRequest('/recyclingPersonnel/getVerifyPerson',params)
}
//根据id获取回收人员信息
export const getVerifyPersonById =(id) =>{
    return getRequest(`/recyclingPersonnel/get/${id}`)
}
//审核通过方法
export const changeStatusToPass =(id,name,openId) =>{
    return getRequest(`/recyclingPersonnel/changeStatusToPass/${id}/${name}/${openId}`)
}
//审核不通过
export const changeStatusToFaild =(id,memo,name,openId) =>{
    return getRequest(`/recyclingPersonnel/changeStatusToFaild/${id}/${memo}/${name}/${openId}`)
}
