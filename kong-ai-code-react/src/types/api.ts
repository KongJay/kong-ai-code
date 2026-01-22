// 基础响应类型
export interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 分页响应类型
export interface PageResponse<T> extends BaseResponse<{
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}> {}

// 用户相关类型
export interface User {
  id: string;
  userAccount: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
  createTime: string;
  updateTime: string;
}

export interface LoginUserVO {
  id: string;
  userAccount: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
}

export interface UserVO {
  id: string;
  userAccount: string;
  userName: string;
  userAvatar?: string;
  userRole: string;
  createTime: string;
}

// 用户请求类型
export interface UserLoginRequest {
  userAccount: string;
  userPassword: string;
}

export interface UserRegisterRequest {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
  userName?: string;
}

export interface UserAddRequest {
  userAccount: string;
  userPassword: string;
  userName: string;
  userRole: string;
}

export interface UserUpdateRequest {
  id: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
}

export interface UserQueryRequest {
  current?: number;
  pageSize?: number;
  userAccount?: string;
  userName?: string;
  userRole?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface DeleteRequest {
  id: string;
}

// 应用相关类型
export interface App {
  id: string;
  appName: string;
  appDesc: string;
  appIcon?: string;
  appType: number;
  scoringStrategy: number;
  reviewStatus: number;
  reviewMessage?: string;
  reviewerId?: string;
  reviewTime?: string;
  userId: string;
  createTime: string;
  updateTime: string;
}

export interface AppVO {
  id: string;
  appName: string;
  appDesc: string;
  appIcon?: string;
  appType: number;
  scoringStrategy: number;
  reviewStatus: number;
  reviewMessage?: string;
  reviewerId?: string;
  reviewTime?: string;
  userId: string;
  user: UserVO;
  codeGenType?: string;  // 代码生成类型
  initPrompt?: string;   // 初始提示词
  createTime: string;
  updateTime: string;
}

export interface AppAddRequest {
  initPrompt: string;
  mode: number;
    // 应用初始化的 prompt（用户需求描述）
}

export interface AppUpdateRequest {
  id: string;
  appName?: string;
  appDesc?: string;
  appIcon?: string;
  appType?: number;
  scoringStrategy?: number;
}

export interface AppAdminUpdateRequest {
  id: string;
  appName?: string;
  appDesc?: string;
  appIcon?: string;
  appType?: number;
  scoringStrategy?: number;
  reviewStatus?: number;
  reviewMessage?: string;
}

export interface AppQueryRequest {
  current?: number;
  pageSize?: number;
  appName?: string;
  appType?: number;
  scoringStrategy?: number;
  reviewStatus?: number;
  userId?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface AppDeployRequest {
  appId: string;
}

// 聊天历史类型（后端返回格式）
export interface ChatHistory {
  id: string;
  appId: string;
  userId: string;
  message: string;           // 消息内容
  messageType: 'user' | 'ai'; // 消息类型
  createTime: string;
  updateTime?: string;
}

// 前端聊天消息类型
export interface ChatMessage {
  id: number | string;
  type: 'user' | 'ai';
  content: string;
  loading?: boolean;
  createTime?: string;
}

export interface ChatHistoryQueryRequest {
  current?: number;
  pageSize?: number;
  appId?: string;
  userId?: string;
  lastCreateTime?: string;  // 游标分页
  sortField?: string;
  sortOrder?: string;
}

// 应用类型枚举
export enum AppType {
  SCORE = 0,
  TEST = 1,
}

// 评分策略枚举
export enum ScoringStrategy {
  CUSTOM = 0,
  AI = 1,
}

// 审核状态枚举
export enum ReviewStatus {
  REVIEWING = 0,
  PASS = 1,
  REJECT = 2,
}

// 用户角色枚举
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
