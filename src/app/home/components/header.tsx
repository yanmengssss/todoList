"use client";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { uiStore } from "@/store/ui";
import { userStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { UserInfoDialog } from "./userInfoDialog";
const items = [
  {
    key: "list",
    label: "任务列表",
    href: "/home/list",
  },
  {
    key: "clander",
    label: "日历视图",
    href: "/home/clander",
  },
  {
    key: "analysis",
    label: "统计分析",
    href: "/home/analysis",
  },
];
const Header = observer(() => {
  const activeItem = usePathname();
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);

  // 获取用户头像或默认头像
  const getUserAvatar = () => {
    if (userStore.userAvatar) {
      return userStore.userAvatar;
    }
    // 如果没有头像，返回默认头像（使用用户名首字母）
    return null;
  };

  // 获取用户名或默认名称
  const getUserName = () => {
    return userStore.userName || "用户";
  };

  // 退出登录
  const handleLogout = () => {
    // 清除用户信息
    userStore.setUserInfo("userId", "");
    userStore.setUserInfo("userName", "");
    userStore.setUserInfo("userAvatar", "");
    userStore.setUserInfo("userEmail", "");
    userStore.setUserInfo("userPhone", "");
    userStore.setUserInfo("userAddress", "");
    userStore.setUserInfo("userBirthday", "");
    // 可以在这里添加跳转到登录页的逻辑
    // window.location.href = "/login";
  };

  return (
    <>
      <div className="flex items-center justify-between w-full h-16 px-6">
        <div className="flex items-center gap-8 flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Todo List
          </h1>
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {items.map((item) => (
                <NavigationMenuItem key={item.key}>
                  <Link
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeItem === item.href
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 cursor-pointer border-2 border-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {getUserAvatar() ? (
                  <Image
                    src={getUserAvatar() || ""}
                    alt={getUserName()}
                    width={40}
                    height={40}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {getUserName().charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel> {getUserName()}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setUserInfoDialogOpen(true)}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>修改信息</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
            {/* <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserName()}
                  </p>
                  {userStore.userEmail && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {userStore.userEmail}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setUserInfoDialogOpen(true)}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>修改信息</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent> */}
          </DropdownMenu>
          <Button
            variant="default"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 border-0"
            onClick={() => uiStore.setIsDrawerOpen(true)}
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI助手
            </span>
          </Button>
        </div>
      </div>
      <UserInfoDialog
        open={userInfoDialogOpen}
        onOpenChange={setUserInfoDialogOpen}
      />
    </>
  );
});

export default Header;
