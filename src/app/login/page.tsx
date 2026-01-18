"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { request } from "@/lib/request";
import { userStore } from "@/store/user";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { WxLoginButton } from "../components/WxLoginButton";
import cookiejs from "js-cookie";
// 登录方式类型
type LoginMethod = "password" | "email";

// 表单验证 schema
const passwordLoginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要 6 位"),
});

const emailOtpSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  otp: z.string().length(6, "OTP 必须是 6 位数字"),
});

type PasswordLoginFormValues = z.infer<typeof passwordLoginSchema>;
type EmailOtpFormValues = z.infer<typeof emailOtpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [loading, setLoading] = useState(false);

  // OTP 弹窗相关状态
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpValue, setOtpValue] = useState("");
  const [otpTargetValue, setOtpTargetValue] = useState("");

  // 密码登录表单
  const passwordForm = useForm<PasswordLoginFormValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 邮箱验证码表单
  const emailOtpForm = useForm<EmailOtpFormValues>({
    resolver: zodResolver(emailOtpSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  // 倒计时效果
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // 发送 OTP
  const sendOTP = async (target: string) => {
    try {
      setLoading(true);
      const response = await request({
        url: "/api/auth/Otp/send-otp",
        method: "POST",
        data: {
          email: target,
          type: "email",
          sence:'login'
        },
      });

      if (response.code === 200) {
        toast.success("验证码已发送到您的邮箱");
        setOtpTargetValue(target);
        setOtpDialogOpen(true);
        setOtpCountdown(60);
        setOtpValue("");
      } else {
        toast.error(response.mes || "发送验证码失败");
      }
    } catch (error: any) {
      toast.error(error?.message || "发送验证码失败");
    } finally {
      setLoading(false);
    }
  };

  // 密码登录
  const handlePasswordLogin = async (values: PasswordLoginFormValues) => {
    try {
      setLoading(true);
      const response = await request({
        url: "/api/auth/login",
        method: "POST",
        data: {
          email: values.email,
          password: values.password,
        },
      });

      if (response.code === 200) {
        const userData = response.data as {
          id?: string;
          name?: string;
          email?: string;
          avatar?: string;
        };
        userStore.setUserInfo("userId", userData.id || "");
        userStore.setUserInfo("userName", userData.name || "");
        userStore.setUserInfo("userEmail", userData.email || "");
        userStore.setUserInfo("userAvatar", userData.avatar || "");

        toast.success("登录成功");
        router.push("/home");
      } else {
        toast.error(response.mes || "登录失败");
      }
    } catch (error: any) {
      toast.error(error?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  // 验证 OTP 并登录
  const handleOtpLogin = async () => {
    if (otpValue.length !== 6) {
      toast.error("请输入完整的 6 位验证码");
      return;
    }

    try {
      setLoading(true);
      const response = await request({
        url: "/api/auth/login",
        method: "POST",
        data: {
          email: otpTargetValue,
          otp: otpValue,
          type: "email",
        },
      });

      if (response.code === 200) {
        toast.success("登录成功");
        cookiejs.set("aToken", response.data.token);
        router.push("/home/list");
      } else {
        toast.error(response.message || "登录失败");
      }
    } catch (error: any) {
      toast.error(error?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理邮箱验证码提交
  const onEmailOtpSubmit = async (values: EmailOtpFormValues) => {
    await sendOTP(values.email);
  };

  // 重新发送 OTP
  const resendOTP = async () => {
    if (otpCountdown > 0) return;
    await sendOTP(otpTargetValue);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/loginBg.jpeg')" }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">登录</CardTitle>
          <CardDescription className="text-center">
            选择登录方式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 登录方式切换 */}
          <div className="flex gap-2 border-b pb-4">
            <Button
              type="button"
              variant={loginMethod === "password" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoginMethod("password")}
            >
              <Lock className="mr-2 h-4 w-4" />
              密码登录
            </Button>
            <Button
              type="button"
              variant={loginMethod === "email" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoginMethod("email")}
            >
              <Mail className="mr-2 h-4 w-4" />
              邮箱登录
            </Button>
          </div>

          {/* 密码登录表单 */}
          {loginMethod === "password" && (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordLogin)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱地址</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="请输入您的邮箱"
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="请输入密码"
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* 邮箱验证码登录表单 */}
          {loginMethod === "email" && (
            <Form {...emailOtpForm}>
              <form className="space-y-4">
                <FormField
                  control={emailOtpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱地址</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="请输入您的邮箱"
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  onClick={() => onEmailOtpSubmit(emailOtpForm.getValues())}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    "发送验证码"
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* 第三方登录 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或使用第三方登录
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <WxLoginButton />

            <GoogleOAuthProvider clientId="208404142536-5e2h96tbrul2pc9aclsbbv5ougka5apn.apps.googleusercontent.com">
              <GoogleLoginButton loading={loading} />
            </GoogleOAuthProvider>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            还没有账号？
            <button
              onClick={() => router.push("/register")}
              className="text-primary hover:underline"
            >
              立即注册
            </button>
            {" · "}
            <button
              onClick={() => router.push("/forgot-password")}
              className="text-primary hover:underline"
            >
              忘记密码？
            </button>
          </div>
        </CardFooter>
      </Card>

      {/* OTP 验证码弹窗 */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>输入验证码</DialogTitle>
            <DialogDescription>
              验证码已发送至 {otpTargetValue}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
                disabled={loading}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-15 h-15 mr-[20px] border-2 border-gray-300 rounded-md"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              {otpCountdown > 0 ? (
                <span>验证码已发送，{otpCountdown} 秒后可重新发送</span>
              ) : (
                <button
                  type="button"
                  onClick={resendOTP}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  重新发送验证码
                </button>
              )}
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={handleOtpLogin}
              disabled={loading || otpValue.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  验证中...
                </>
              ) : (
                "确认登录"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
