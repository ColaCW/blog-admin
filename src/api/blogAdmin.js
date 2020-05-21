import axios from '@/api/fetch';
import SERVER from '@/api/server';

// 根据登录用户获取菜单
export const getMenusByRole = params => axios.get(`${SERVER.SERVICE_HOST}/api/web/getMenusByRole.do`);

// 登录
export const login = params => axios.post(`${SERVER.SERVICE_HOST}/api/web/login.do`, params);

// 登出
export const logout = params => axios.post(`${SERVER.SERVICE_HOST}/api/web/logout.do`, params);
