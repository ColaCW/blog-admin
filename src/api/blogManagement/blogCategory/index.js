import axios from '@/api/fetch';
import SERVER from '@/api/server';

// 分页查询
export const search = params => axios.get(`${SERVER.SERVICE_HOST1}/admin/blogCategory/search`, { params });

// 按ID查询数据
export const getById = id => axios.get(`${SERVER.SERVICE_HOST1}/admin/blogCategory/getById/${id}`);

// 进行数据新增
export const add = params => axios.post(`${SERVER.SERVICE_HOST1}/admin/blogCategory/add`, params);

// 进行数据修改
export const alter = params => axios.post(`${SERVER.SERVICE_HOST1}/admin/blogCategory/alter`, params);

// 根据id删除对象
export const del = id => axios.post(`${SERVER.SERVICE_HOST1}/admin/blogCategory/del/${id}`);

// 根据IDs批量删除对象
export const deleteBatch = ids => axios.post(`${SERVER.SERVICE_HOST1}/admin/blogCategory/deleteBatch/${ids}`);
