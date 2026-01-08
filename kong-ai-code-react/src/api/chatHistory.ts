import request from '@/lib/request';
import type {
  BaseResponse,
  PageResponse,
  ChatHistory,
  ChatHistoryQueryRequest,
} from '@/types/api';

// 获取应用聊天历史（支持游标分页）
export const listAppChatHistory = (params: {
  appId: string;
  pageSize?: number;
  lastCreateTime?: string;
}) => {
  const { appId, pageSize = 10, lastCreateTime } = params;
  return request<PageResponse<ChatHistory>>({
    url: `/chatHistory/app/${appId}`,
    method: 'GET',
    params: { pageSize, lastCreateTime },
  });
};

// 管理员分页查询聊天历史
export const listAllChatHistoryByPageForAdmin = (data: ChatHistoryQueryRequest) => {
  return request<PageResponse<ChatHistory>>({
    url: '/chatHistory/admin/list/page/vo',
    method: 'POST',
    data,
  });
};
