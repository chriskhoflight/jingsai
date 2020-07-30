// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

// 获取内容数据 多条件
export const getWechatContentList = (params) => {
    return getRequest('/content/getByCondition', params)
}
// 删除内容
export const deleteContent = (ids, params) => {
    return deleteRequest(`/content/delByIds/${ids}`, params)
}
// 编辑
export const editContent = (params) => {
    return postRequest('/content/content/edit', params)
    
}
// 保存内容
export const saveContent = (params) => {
    return postRequest('/content/content/add', params)
}
// 通过id获取单个内容
export const getWechatContent = (id) => {
    return getRequest(`/content/content/get/${id}`)
}
// 通过内容类别获取最新单个内容
export const getContentByContentType = (contentType) => {
    return getRequest(`/content/content/getInfo/${contentType}`)
}