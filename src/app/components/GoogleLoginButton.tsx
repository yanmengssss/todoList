"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button"; // 假设你使用的是 shadcn/ui
import { request } from "@/lib/request";
import { toast } from "sonner";
import cookiejs from "js-cookie";
import { useRouter } from "next/navigation";
const GoogleLoginButton = ({ loading }) => {
  const router = useRouter();
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const res = await request({
        url: "/api/auth/oauth",
        method: "POST",
        data: {
          token: tokenResponse.access_token,
        },
      });
      console.log(res);
      if (res.code === 200&& res.data) {
        toast.success("登录成功");
        cookiejs.set("aToken", res.data.atk);
        router.push("/home/list");
      }else{
        toast.error(res.message);
      }
    },
    onError: () => {
      console.error("登录失败");
      toast.error("登录失败");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => login()} // 注意：这里直接执行 login()
      disabled={loading}
    >
      谷歌登录
    </Button>
  );
};

export default GoogleLoginButton;
