// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

//微信公众号管理模块
//分页查询
export const getAccountPage = (params) => {
    return getRequest('/wechatOfficialAccount/getByCondition', params)
}
 
// 添加
export const addAccount = (params) => {
    return postRequest('/wechatOfficialAccount/add', params)
}
// 编辑
export const editAccount = (params) => {
    return putRequest('/wechatOfficialAccount/edit', params)
}

// 删除
export const delAccount = (ids, params) => {
    return deleteRequest(`/wechatOfficialAccount/deleteByIds/${ids}`, params)
}

//获取菜单
export const getWxMenu = (id, params) => {
    return getRequest(`/wechatOfficialAccount/getWxMenu/${id}`, params)
}

//创建菜单
export const createWxMenu = (params) => {
    return postRequest('/wechatOfficialAccount/menuCreate', params)
}

//-------------菜单模版--------------------
//分页查询
export const getMenuTemplatePage = (params) => {
    return getRequest('/wechatMenuTemplate/getByCondition', params)
}
// 添加菜单模版
export const addMenuTemplate = (params) => {
    return postRequest('/wechatMenuTemplate/save', params)
}

// 编辑菜单模版
export const editMenuTemplate = (params) => {
    return putRequest('/wechatMenuTemplate/update', params)
}

// 删除菜单模版
export const delMenuTemplate = (ids, params) => {
    return deleteRequest(`/wechatMenuTemplate/removeByIds/${ids}`, params)
}

//获取所有菜单模版
export const getAllMenuTemplate = (params) => {
    return getRequest('/wechatMenuTemplate/getAllList', params)
}

//-------------菜单明细--------------------
// 根据模版ID 获取菜单树
export const getMenuTreeByTemplateId = (templateId,params) => {
    return getRequest(`/wechatMenuTemplateDetail/getMenuTreeByTemplateId/${templateId}`, params)
}

// 添加自定义菜单
export const addMenuTemplateDetail = (params) => {
    return postRequest('/wechatMenuTemplateDetail/save', params)
}

// 编辑自定义菜单
export const editMenuTemplateDetail = (params) => {
    return putRequest('/wechatMenuTemplateDetail/update', params)
}

// 删除自定义菜单
export const delMenuTemplateDetail = (ids, params) => {
    return deleteRequest(`/wechatMenuTemplateDetail/removeByIds/${ids}`, params)
}