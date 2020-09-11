import axios from '@/api/fetch';
import SERVER from '@/api/server';

// 分页查询
export const search = params => axios.get(`${SERVER.SERVICE_HOST}/admin/blogCategory/search`, { params });

// 按ID查询数据
export const getById = id => axios.get(`${SERVER.SERVICE_HOST}/admin/blogCategory/getById/${id}`);

// 进行数据新增
export const add = params => axios.post(`${SERVER.SERVICE_HOST}/admin/blogCategory/add`, params);

// 进行数据修改
export const alter = params => axios.post(`${SERVER.SERVICE_HOST}/admin/blogCategory/alter`, params);

// 根据id删除对象
export const del = id => axios.post(`${SERVER.SERVICE_HOST}/admin/blogCategory/del/${id}`);

// 根据IDs批量删除对象
export const deleteBatch = ids => axios.post(`${SERVER.SERVICE_HOST}/admin/blogCategory/deleteBatch/${ids}`);
