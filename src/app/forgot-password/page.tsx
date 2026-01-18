"use client";

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
import { request } from "@/lib/request";
import { validatePassword } from "@/lib/utils";

// 密码验证函数：至少包含三种字符类型（数字、大写字母、小写字母、特殊字符
// 找回密码表单验证 schema
const resetPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string()
    .min(8, "密码至少需要 8 位")
    .refine(validatePassword, {
      message: "密码必须至少包含三种字符类型（数字、大写字母、小写字母、特殊字符）",
    }),
  rePassword: z.string().min(8, "请确认密码"),
  otp: z.string().length(6, "验证码必须是 6 位数字"),
}).refine((data) => data.password === data.rePassword, {
  message: "两次输入的密码不一致",
  path: ["rePassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // 找回密码表单
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      rePassword: "",
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

  // 发送验证码
  const sendOTP = async () => {
    const email = resetPasswordForm.getValues("email");
    
    // 验证邮箱格式
    if (!email) {
      toast.error("请先输入邮箱地址");
      return;
    }

    try {
      const emailResult = resetPasswordSchema.shape.email.safeParse(email);
      if (!emailResult.success) {
        toast.error("请输入有效的邮箱地址");
        return;
      }

      setSendingOTP(true);
      const response = await request({
        url: "/api/auth/Otp/send-otp",
        method: "POST",
        data: {
          email: email,
          type: "email",
          sence: "forgot",
        },
      });

      if (response.code === 200) {
        toast.success("验证码已发送到您的邮箱");
        setOtpCountdown(60);
      } else {
        toast.error(response.mes || "发送验证码失败");
      }
    } catch (error: any) {
      toast.error(error?.message || "发送验证码失败");
    } finally {
      setSendingOTP(false);
    }
  };

  // 处理找回密码表单提交
  const handleResetPasswordSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setLoading(true);
      const response = await request({
        url: "/api/auth/reset-password",
        method: "POST",
        data: {
          email: values.email,
          password: values.password,
          rePassword: values.rePassword,
          otp: values.otp,
          type: "email",
        },
      });

      if (response.code === 200) {
        toast.success("密码重置成功");
        router.push("/login");
      } else {
        toast.error(response.mes || "密码重置失败");
      }
    } catch (error: any) {
      toast.error(error?.message || "密码重置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/loginBg.jpeg')" }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">找回密码</CardTitle>
          <CardDescription className="text-center">
            重置您的账号密码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...resetPasswordForm}>
            <form
              onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={resetPasswordForm.control}
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
                          placeholder="请输入您的注册邮箱"
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
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新密码</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="请输入新密码（8位以上，包含三种字符类型）"
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
                control={resetPasswordForm.control}
                name="rePassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认新密码</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="请再次输入新密码"
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
                control={resetPasswordForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>验证码</FormLabel>
                    <FormControl>
                      <div className="space-y-2 flex gap-2 items-center">
                        <Input
                          {...field}
                          type="text"
                          placeholder="请输入6位验证码"
                          maxLength={6}
                          disabled={loading || sendingOTP}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={sendOTP}
                          disabled={loading || sendingOTP || otpCountdown > 0}
                        >
                          {sendingOTP ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              发送中...
                            </>
                          ) : otpCountdown > 0 ? (
                            `${otpCountdown} 秒后可重新发送`
                          ) : (
                            "发送验证码"
                          )}
                        </Button>
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
                    重置中...
                  </>
                ) : (
                  "重置密码"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            想起密码了？
            <button
              onClick={() => router.push("/login")}
              className="text-primary hover:underline ml-1"
            >
              返回登录
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
