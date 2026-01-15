"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userStore } from "@/store";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// 定义表单验证规则
const userInfoFormSchema = z.object({
  userName: z.string().min(1, "用户名不能为空"),
  userEmail: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  userPhone: z.string().optional(),
  userAddress: z.string().optional(),
  userBirthday: z.date().optional(),
});

type UserInfoFormValues = z.infer<typeof userInfoFormSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const UserInfoDialog = observer(({ open, onOpenChange }: Props) => {
  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoFormSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userPhone: "",
      userAddress: "",
      userBirthday: undefined,
    },
  });

  // 当对话框打开时，加载用户信息
  React.useEffect(() => {
    if (open) {
      form.reset({
        userName: userStore.userName || "",
        userEmail: userStore.userEmail || "",
        userPhone: userStore.userPhone || "",
        userAddress: userStore.userAddress || "",
        userBirthday: userStore.userBirthday
          ? new Date(userStore.userBirthday)
          : undefined,
      });
    }
  }, [open, form]);

  const onSubmit = async (values: UserInfoFormValues) => {
    // 更新用户信息到 store
    userStore.setUserInfo("userName", values.userName);
    if (values.userEmail) {
      userStore.setUserInfo("userEmail", values.userEmail);
    }
    if (values.userPhone) {
      userStore.setUserInfo("userPhone", values.userPhone);
    }
    if (values.userAddress) {
      userStore.setUserInfo("userAddress", values.userAddress);
    }
    if (values.userBirthday) {
      userStore.setUserInfo("userBirthday", values.userBirthday.toISOString());
    }

    // 这里可以添加 API 调用来保存用户信息
    // await updateUserInfo(values);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>修改个人信息</DialogTitle>
          <DialogDescription>
            更新您的个人信息，修改后点击保存
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* UserName */}
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入用户名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UserEmail */}
            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="请输入邮箱"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UserPhone */}
            <FormField
              control={form.control}
              name="userPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手机号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入手机号" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UserAddress */}
            <FormField
              control={form.control}
              name="userAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>地址</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入地址"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UserBirthday */}
            <FormField
              control={form.control}
              name="userBirthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>生日</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              选择日期
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

