"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { listUserVoByPage, addUser, updateUser, deleteUser } from "@/api";
import type { UserVO, UserAddRequest, UserUpdateRequest, UserQueryRequest, DeleteRequest } from "@/types/api";
import { message } from "@/components/ui/toast";

export default function UserManagePage() {
  const [users, setUsers] = useState<UserVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryRequest, setQueryRequest] = useState<UserQueryRequest>({
    current: 1,
    pageSize: 10,
  });
  const [searchForm, setSearchForm] = useState({
    userAccount: "",
    userName: "",
    userRole: "",
  });

  // 添加用户对话框
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    userAccount: "",
    userName: "",
    userRole: "user",
  });
  const [adding, setAdding] = useState(false);

  // 编辑用户对话框
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserVO | null>(null);
  const [editForm, setEditForm] = useState({
    userName: "",
    userRole: "",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [queryRequest]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await listUserVoByPage({
        ...queryRequest,
        ...searchForm,
      });
      if (response.code === 0) {
        setUsers(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || "获取用户列表失败");
      }
    } catch (error) {
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setQueryRequest(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page: number) => {
    setQueryRequest(prev => ({ ...prev, current: page }));
  };

  const handleAddUser = async () => {
    if (!addForm.userAccount || !addForm.userName) {
      message.error("请填写完整信息");
      return;
    }

    setAdding(true);
    try {
      const request: UserAddRequest = {
        userAccount: addForm.userAccount,
        userName: addForm.userName,
        userPassword: "12345678",
        userRole: addForm.userRole,
      };

      const response = await addUser(request);
      if (response.code === 0) {
        message.success("用户添加成功");
        setAddDialogOpen(false);
        setAddForm({ userAccount: "", userName: "", userRole: "user" });
        loadUsers();
      } else {
        message.error(response.message || "添加用户失败");
      }
    } catch (error) {
      message.error("添加用户失败");
    } finally {
      setAdding(false);
    }
  };

  const handleEditUser = (user: UserVO) => {
    setEditingUser(user);
    setEditForm({
      userName: user.userName || "",
      userRole: user.userRole,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setEditing(true);
    try {
      const request: UserUpdateRequest = {
        id: editingUser.id,
        userName: editForm.userName,
        userRole: editForm.userRole,
      };

      const response = await updateUser(request);
      if (response.code === 0) {
        message.success("用户更新成功");
        setEditDialogOpen(false);
        setEditingUser(null);
        loadUsers();
      } else {
        message.error(response.message || "更新用户失败");
      }
    } catch (error) {
      message.error("更新用户失败");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const request: DeleteRequest = { id: userId };
      const response = await deleteUser(request);
      if (response.code === 0) {
        message.success("用户删除成功");
        loadUsers();
      } else {
        message.error(response.message || "删除用户失败");
      }
    } catch (error) {
      message.error("删除用户失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            用户管理
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            管理系统中的所有用户账号
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加用户
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加用户</DialogTitle>
              <DialogDescription>
                创建新用户账号，默认密码为12345678
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-userAccount">账号</Label>
                <Input
                  id="add-userAccount"
                  value={addForm.userAccount}
                  onChange={(e) => setAddForm(prev => ({ ...prev, userAccount: e.target.value }))}
                  placeholder="请输入账号"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-userName">昵称</Label>
                <Input
                  id="add-userName"
                  value={addForm.userName}
                  onChange={(e) => setAddForm(prev => ({ ...prev, userName: e.target.value }))}
                  placeholder="请输入昵称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-userRole">角色</Label>
                <Select
                  value={addForm.userRole}
                  onValueChange={(value) => setAddForm(prev => ({ ...prev, userRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">普通用户</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddUser} disabled={adding}>
                  {adding ? "添加中..." : "添加"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle>用户搜索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>账号</Label>
              <Input
                value={searchForm.userAccount}
                onChange={(e) => setSearchForm(prev => ({ ...prev, userAccount: e.target.value }))}
                placeholder="搜索账号"
              />
            </div>
            <div className="space-y-2">
              <Label>昵称</Label>
              <Input
                value={searchForm.userName}
                onChange={(e) => setSearchForm(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="搜索昵称"
              />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={searchForm.userRole}
                onValueChange={(value) => setSearchForm(prev => ({ ...prev, userRole: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="user">普通用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            共 {total} 个用户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>账号</TableHead>
                <TableHead>昵称</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.userAccount}</TableCell>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>
                    <Badge variant={user.userRole === "admin" ? "default" : "secondary"}>
                      {user.userRole === "admin" ? "管理员" : "普通用户"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除用户 "{user.userName}" 吗？此操作不可撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                              删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              显示第 {((queryRequest.current || 1) - 1) * (queryRequest.pageSize || 10) + 1} 到 {Math.min((queryRequest.current || 1) * (queryRequest.pageSize || 10), total)} 条，共 {total} 条
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange((queryRequest.current || 1) - 1)}
                disabled={(queryRequest.current || 1) <= 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange((queryRequest.current || 1) + 1)}
                disabled={(queryRequest.current || 1) * (queryRequest.pageSize || 10) >= total}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 编辑用户对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-userName">昵称</Label>
              <Input
                id="edit-userName"
                value={editForm.userName}
                onChange={(e) => setEditForm(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="请输入昵称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-userRole">角色</Label>
              <Select
                value={editForm.userRole}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, userRole: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">普通用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateUser} disabled={editing}>
                {editing ? "更新中..." : "更新"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
