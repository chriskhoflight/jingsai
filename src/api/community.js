// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

//查询所有的小区排班记录
export const getScheduleList =(params) =>{
    return getRequest('/estateSchedule/findScheduleList',params)
}
//取得所有小区编码
export const getEstateCode =(params) =>{
    return getRequest ('/estateInfo/getAllCodesAndName',params)
}
//添加排班信息
export const addSchedule= (params) =>{
    return postRequest('/estateSchedule/save',params)
}
//启用排班
export const enableSchedule =(id,params) =>{
    return postRequest(`/estateSchedule/enableSchedule/${id}`,params)
}
//禁用排班
export const disableSchedule =(id,params)=>{
    return postRequest(`/estateSchedule/disableSchedule/${id}`,params)
}
//编辑排班信息
export const editSchedule = (params) =>{
    return putRequest('/estateSchedule/update',params)
}
//删除排班信息
export const deleteSchedule =(ids,params) =>{
    return deleteRequest(`/estateSchedule/removeByIds/${ids}`,params)
}
//查询小区基本信息
export const getEstateInfo = (params) =>{
    return getRequest('/estateInfo/getByCondition',params)
}
//验证小区编码是否唯一
export const selectByCode = (params) =>{
    return getRequest('/estateInfo/getByCode',params)
}//删除小区信息
export const deleteEstate= (ids,params) =>{
    return deleteRequest(`/estateInfo/removeByIds/${ids}`,params)
}
//编辑小区信息
export const editEstate = (params) =>{
    return putRequest('/estateInfo/update',params)
}
//新增小区信息
export const addEstate = (params) =>{
    return postRequest('/estateInfo/save',params)
}
//根据小区编码查看小区的排班信息 
export const findScheduleByCode =(params) =>{
    return getRequest('/estateSchedule/findByCodeTwo',params)
}
//根据小区编码数组查看小区路线
export const findByCodesArray =(params) =>{
    return getRequest('/estateInfo/selectByCodes',params)
}

//根据小区编码批量查看小区是否有排班信息 
export const findByCodes =(codes) =>{
    return getRequest(`/estateSchedule/findByCodes/${codes}`)
}