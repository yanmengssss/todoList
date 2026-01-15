import { trackError, generateLog } from "@/lib/db/mongo";
import redis from "@/lib/db/redis";
import { toObj } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, type, otp } = await request.json();
    const sendOtp = await redis.get(type + "-" + email);
    if (otp !== sendOtp) {
      const res = JSON.stringify({ code: 400, message: "验证码错误" });
      generateLog(request, res);
      return new Response(res, {
        status: 400,
      });
    } else {
      const res = JSON.stringify({ code: 200, message: "验证码正确" });
      generateLog(request, res);
      return new Response(res, {
        status: 200,
      });
    }
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(request), toObj(error));
    const res = { code: 500, data: null, mes: message };
    generateLog(request, res);
    return NextResponse.json(res);
  }
}
