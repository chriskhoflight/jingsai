// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

//垃圾回收商品

//分页模糊获取商品信息
export const getGoodsList =(params) =>{
    return getRequest('/garbageCollectionGoods/getAllDataByPage',params)
}
//启用商品
export const enableGoods = (id,params) =>{
    return postRequest(`/garbageCollectionGoods/enableGoods/${id}`,params)
}
//禁用商品
export const disableGoods =(id,params) =>{
    return postRequest(`/garbageCollectionGoods/disableGoods/${id}`,params)
}
//添加商品
export const addGoods = (params) =>{
    return postRequest('/garbageCollectionGoods/save',params)
}
//编辑商品信息
export const editGoods = (params) =>{
    return putRequest('/garbageCollectionGoods/update',params)
}
//删除商品信息
export const deleteGoods = (ids,params) =>{
    return deleteRequest(`/garbageCollectionGoods/removeByIds/${ids}`,params)
}
//商品价格因素配置
//获取价格因素配置信息
export const getFactorList =(params) =>{
    return getRequest('/priceFactorList/getByCondition',params)
}
//启用价格因素
export const enableFactor =(id,params) =>{
    return postRequest(`/priceFactorList/enableFactor/${id}`,params)
}
//禁用价格因素
export const disableFactor =(id,params) =>{
    return postRequest(`/priceFactorList/disableFactor/${id}`,params)
}
//编辑价格因素
export const editFactor =(params) =>{
    return putRequest('/priceFactorList/update',params)
}
//添加价格因素
export const addFactor =(params) =>{
    return postRequest('/priceFactorList/save',params)
}
//删除价格因素
export const deleteFactor =(ids,params) =>{
    return deleteRequest(`/priceFactorList/removeByIds/${ids}`,params)
}
//获取一级分类
export const initClassify = (params) =>{
    return getRequest('/garbageCollectionClassify/getByParentId/0',params)
}
// 加载分类子分类数据
export const loadClassify =(id,params) =>{
    return getRequest(`/garbageCollectionClassify/getByParentId/${id}`,params)
}
// 搜素分类
export const searchClassify = (params) =>{
    return getRequest('/garbageCollectionClassify/search',params)
}
//添加分类
export const addClassify = (params) =>{
    return postRequest('/garbageCollectionClassify/add',params)
}
//通过id获取分类信息
export const getByClassifyId = (id,params) =>{
    return getRequest(`/garbageCollectionClassify/get/${id}`,params)
}
//获取所有规格类目信息
export const getAllSpeClassify = (params) =>{
    return getRequest('/specificationClassify/getAllList',params)
}
//验证价格因素KEY是否唯一
export const selectByPriceKey = (params) =>{
    return getRequest('/priceFactorList/getByPriceKey',params)
}
//获取所有的二级分类
export const getSecondClassify = (params) =>{
    return getRequest('/garbageCollectionClassify/getSecondClassify',params)
}