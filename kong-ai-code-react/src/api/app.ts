import request from '@/lib/request';
import type {
  BaseResponse,
  PageResponse,
  AppVO,
  AppAddRequest,
  AppUpdateRequest,
  AppAdminUpdateRequest,
  AppQueryRequest,
  AppDeployRequest,
  DeleteRequest,
} from '@/types/api';

// 添加应用
export const addApp = (data: AppAddRequest) => {
  return request<BaseResponse<string>>({
    url: '/app/add',
    method: 'POST',
    data,
  });
};

// 删除应用
export const deleteApp = (data: DeleteRequest) => {
  return request<BaseResponse<boolean>>({
    url: '/app/delete',
    method: 'POST',
    data,
  });
};

// 管理员删除应用
export const deleteAppByAdmin = (data: DeleteRequest) => {
  return request<BaseResponse<boolean>>({
    url: '/app/admin/delete',
    method: 'POST',
    data,
  });
};

// 更新应用
export const updateApp = (data: AppUpdateRequest) => {
  return request<BaseResponse<boolean>>({
    url: '/app/update',
    method: 'POST',
    data,
  });
};

// 管理员更新应用
export const updateAppByAdmin = (data: AppAdminUpdateRequest) => {
  return request<BaseResponse<boolean>>({
    url: '/app/admin/update',
    method: 'POST',
    data,
  });
};

// 根据ID获取应用
export const getAppVoById = (id: string) => {
  return request<BaseResponse<AppVO>>({
    url: '/app/get/vo',
    method: 'GET',
    params: { id },
  });
};

// 管理员根据ID获取应用
export const getAppVoByIdByAdmin = (id: string) => {
  return request<BaseResponse<AppVO>>({
    url: '/app/admin/get/vo',
    method: 'GET',
    params: { id },
  });
};

// 分页查询应用（我的应用）
export const listMyAppVoByPage = (data: AppQueryRequest) => {
  return request<PageResponse<AppVO>>({
    url: '/app/my/list/page/vo',
    method: 'POST',
    data,
  });
};

// 分页查询应用（精选应用）
export const listGoodAppVoByPage = (data: AppQueryRequest) => {
  return request<PageResponse<AppVO>>({
    url: '/app/good/list/page/vo',
    method: 'POST',
    data,
  });
};

// 分页查询应用（管理员）
export const listAppVoByPageByAdmin = (data: AppQueryRequest) => {
  return request<PageResponse<AppVO>>({
    url: '/app/admin/list/page/vo',
    method: 'POST',
    data,
  });
};

// 部署应用
export const deployApp = (data: AppDeployRequest) => {
  return request<BaseResponse<string>>({
    url: '/app/deploy',
    method: 'POST',
    data,
  });
};

// 下载应用代码
export const downloadAppCode = (appId: string) => {
  return request<Blob>({
    url: `/app/download/${appId}`,
    method: 'GET',
    responseType: 'blob',
  });
};

// 聊天生成代码
export const chatToGenCode = (params: { appId: string; message: string }) => {
  return request<string[]>({
    url: '/app/chat/gen/code',
    method: 'GET',
    params,
  });
};
