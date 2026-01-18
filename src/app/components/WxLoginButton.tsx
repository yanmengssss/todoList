"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { request } from "@/lib/request";
import { cn, getRandoCode } from "@/lib/utils";
import router from "next/router";
import { toast } from "sonner";
import cookiejs from "js-cookie";
interface QrcodeData {
  ticket: string;
  expire_seconds: number;
}

interface LoginResponse {
  atk: string;
  rtk: string;
  message: string;
}

export const WxLoginButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrcodeUrl, setQrcodeUrl] = useState<string>("");
  const [expireTime, setExpireTime] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const isLoginSuccessRef = useRef(false);
  const intervalTimer= useRef<NodeJS.Timeout | null>(null);
  // 保存 code 和 state 用于轮询
  const codeRef = useRef<string>("");
  const stateRef = useRef<string>("");

  // 定期检查二维码是否过期
  useEffect(() => {
    if (!expireTime) return;

    const checkExpired = () => {
      const now = Date.now();
      if (now >= expireTime) {
        setIsExpired(true);
      }
    };

    // 立即检查一次
    checkExpired();

    // 每秒检查一次
    const interval = setInterval(checkExpired, 1000);

    return () => clearInterval(interval);
  }, [expireTime]);

  const handleGetQrcode = useCallback(async () => {
    setLoading(true);
    setIsExpired(false);
    setQrcodeUrl("");

    try {
      // 生成随机 code
      const code = getRandoCode(6);
      const state = getRandoCode(6);
      
      // 保存到 ref 用于轮询
      codeRef.current = code;
      stateRef.current = state;
      
      // 请求 API
      const response = await request<QrcodeData>({
        method: "GET",
        url: `/api/auth/wx/code?code=${code}&state=${state}`,
      });

      if (response.code === 200 && response.data) {
        const { ticket, expire_seconds } = response.data;
        
        // 生成二维码 URL
        const qrcodeImageUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket)}`;
        setQrcodeUrl(qrcodeImageUrl);
        
        // 计算过期时间（当前时间 + 过期秒数）
        const expireTimestamp = Date.now() + expire_seconds * 1000;
        setExpireTime(expireTimestamp);
        setIsExpired(false);
        intervalTimer.current = setInterval(getLoginStatus, 2000);
      } else {
        console.error("获取二维码失败:", response.mes);
      }
    } catch (error) {
      console.error("请求错误:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  const getLoginStatus=async ()=>{
    if(isLoginSuccessRef.current){
      return
    }
    const res = await request<LoginResponse>({
      method: "POST",
      url: "/api/auth/wx/code",
      data: {
        code:codeRef.current,
        state:stateRef.current,
      },
    });
    if (res.code === 200) {
      toast.success("登录成功");
      cookiejs.set("aToken", res.data.atk);
      router.push("/home/list");
    }else{
      toast.error(res.message);
    }
  };
  // 当弹窗打开时，自动获取二维码
  useEffect(() => {
    if (dialogOpen) {
      setIsLoginSuccess(false);
      isLoginSuccessRef.current = false;
      handleGetQrcode();
    } else {
      // 关闭弹窗时重置状态
      setQrcodeUrl("");
      setExpireTime(0);
      setIsExpired(false);
      setIsLoginSuccess(false);
      isLoginSuccessRef.current = false;
      codeRef.current = "";
      stateRef.current = "";
      if( intervalTimer.current){
        clearInterval(intervalTimer.current);
        intervalTimer.current = null;
      }
    }
  }, [dialogOpen, handleGetQrcode]);


  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="w-full"
      >
        微信登录
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>微信扫码登录</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative w-64 h-64 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-900">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">获取二维码中...</span>
                </div>
              ) : isLoginSuccess ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                  <span className="text-lg font-semibold text-green-600">登录成功</span>
                  <span className="text-sm text-muted-foreground">正在跳转...</span>
                </div>
              ) : qrcodeUrl ? (
                <>
                  <Image
                    src={qrcodeUrl}
                    alt="微信登录二维码"
                    width={256}
                    height={256}
                    unoptimized
                    className={cn(
                      "w-full h-full object-contain rounded-lg",
                      isExpired && "opacity-50 grayscale"
                    )}
                  />
                  {isExpired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-lg">
                      <span className="text-white font-semibold text-lg">已过期</span>
                    </div>
                  )}
                </>
              ) : null}
            </div>
            {!loading && qrcodeUrl && !isExpired && (
              <p className="text-sm text-muted-foreground text-center">
                请使用微信扫描上方二维码登录
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
