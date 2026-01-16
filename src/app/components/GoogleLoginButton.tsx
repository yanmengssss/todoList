import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button"; // 假设你使用的是 shadcn/ui
import { request } from "@/lib/request";

const GoogleLoginButton = ({ loading }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("登录成功，Token 信息:", tokenResponse);
      const res = await request({
        url: "/api/auth/oauth",
        method: "POST",
        data: {
          token: tokenResponse.access_token,
        },
      });
      console.log(res);
    },
    onError: () => {
      console.error("登录失败");
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
