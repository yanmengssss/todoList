import redis from "@/lib/db/redis";
import { sendMail } from "@/lib/message";

export async function POST(request: Request) {
  const { type, email, password, otp } = await request.json();
  //从redis中查看
  const sendOtp = await redis.get("login-" + email);
  if (otp !== sendOtp) {
    return new Response(JSON.stringify({ message: "验证码错误" }), {
      status: 400,
    });
  }
}
