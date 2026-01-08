import request from '@/lib/request';
import type {
  BaseResponse,
  PageResponse,
  UserLoginRequest,
  UserRegisterRequest,
  UserAddRequest,
  UserUpdateRequest,
  UserQueryRequest,
  DeleteRequest,
  UserVO,
  LoginUserVO,
} from '@/types/api';

// 用户登录
export const userLogin = (data: UserLoginRequest) => {
  return request<BaseResponse<LoginUserVO>>({
    url: '/user/login',
    method: 'POST',
    data,
  });
};

// 用户注册
export const userRegister = (data: UserRegisterRequest) => {
  return request<BaseResponse<string>>({
    url: '/user/register',
    method: 'POST',
    data,
  });
};

// 用户注销
export const userLogout = () => {
  return request<BaseResponse<boolean>>({
    url: '/user/logout',
    method: 'POST',
  });
};

// 获取当前登录用户
export const getLoginUser = () => {
  return request<BaseResponse<LoginUserVO>>({
    url: '/user/get/login',
    method: 'GET',
  });
};

// 添加用户
export const addUser = (data: UserAddRequest) => {
  return request<BaseResponse<string>>({
    url: '/user/add',
    method: 'POST',
    data,
  });
};

// 删除用户
export const deleteUser = (data: DeleteRequest) => {
  return request<BaseResponse<boolean>>({
    url: '/user/delete',
    method: 'POST',
    data,
  });
};

// 更新用户
export const updateUser = (data: UserUpdateRequest) => {
  return request<BaseResponse<boolean>>({
    url: '/user/update',
    method: 'POST',
    data,
  });
};

// 根据ID获取用户
export const getUserById = (id: string) => {
  return request<BaseResponse<UserVO>>({
    url: '/user/get/vo',
    method: 'GET',
    params: { id },
  });
};

// 分页查询用户
export const listUserVoByPage = (data: UserQueryRequest) => {
  return request<PageResponse<UserVO>>({
    url: '/user/list/page/vo',
    method: 'POST',
    data,
  });
};
