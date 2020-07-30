import {getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

//多条件分页获取分类信息
export const getAllClassify =(params) =>{
    return getRequest('/rubbishClassify/getByCondition',params)
}
//添加分类
export const addClassify = (params) =>{
    return postRequest('/rubbishClassify/save',params)
}
//启用分类
export const enableClassify = (id,params) =>{
    return postRequest(`/rubbishClassify/enableClassify/${id}`,params)
}
//禁用分类
export const disableClassify = (id,params) =>{
    return postRequest(`/rubbishClassify/disableClassify/${id}`,params)
}
//编辑分类信息
export const editClassify = (params) =>{
    return putRequest('/rubbishClassify/update',params)
}
//删除分类
export const deleteClassify = (ids,params) =>{
    return deleteRequest(`/rubbishClassify/removeByIds/${ids}`,params)
}
//获取一级分类
export const initClassify = (params) =>{
    return getRequest('/rubbishClassify/getByParentId/0',params)
}
//加载分类子分类数据
export const loadClassify =(id,params)=>{
    return getRequest(`/rubbishClassify/getByParentId/${id}`,params)
}
//通过id获取分类信息
export const getByClassifyId = (id,params) =>{
    return getRequest(`/rubbishClassify/get/${id}`,params)
}
//获取所有垃圾分类信息
export const getRubbishClassify = (params) =>{
    return getRequest('/rubbishClassify/getAllList',params)
}
//获取所有垃圾详情信息
export const getRubbishDetail = (params) =>{
    return getRequest('/rubbishDetail/getAllDataByPage',params)
}
//添加垃圾详情信息
export const addRubbishDetail = (params) =>{
    return postRequest('/rubbishDetail/save',params)
}
//编辑垃圾详情信息
export const editRubbishDetail = (params) =>{
    return putRequest('/rubbishDetail/update',params)
}
//删除垃圾详情信息
export const deleteRubbishDetail = (ids,params) =>{
    return deleteRequest(`/rubbishDetail/removeByIds/${ids}`,params)
}
