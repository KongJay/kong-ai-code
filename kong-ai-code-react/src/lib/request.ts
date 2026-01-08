import axios, { AxiosResponse, type AxiosRequestConfig } from 'axios';
import JSONbig from 'json-bigint';

const JSONbigString = JSONbig({ storeAsString: true });

// 创建axios实例
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8123/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // 关键：用 json-bigint 在“解析阶段”保留超大整数精度（以 string 形式存储）
  transformResponse: [
    (data) => {
      if (data === null || data === undefined || data === '') return data;
      if (typeof data !== 'string') return data;
      try {
        return JSONbigString.parse(data);
      } catch {
        // 非 JSON 响应（或已被上层处理），直接返回原始数据
        return data;
      }
    },
  ],
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/user/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 统一请求方法（带类型）
 *
 * 说明：axios 默认类型会把返回值视为 AxiosResponse<T>，但我们在响应拦截器里已经 return response.data，
 * 所以这里封装一层，让 TS 正确推断为 Promise<T>，业务侧就可以直接使用 response.code / response.data。
 */
export default function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return instance.request<any, T>(config);
}
