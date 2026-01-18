import { generateLog, trackError } from "@/lib/db/mongo";
import redis from "@/lib/db/redis";
import { sendMail } from "@/lib/message";
import { getRandoCode, toObj } from "@/lib/utils";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const { email, type, sence } = await request.json();
    const opt = getRandoCode(6, "number");
    await sendMail(email, type, opt);
    await redis.set(type + "-" + email + '-' + sence, opt, { ex: 60 * 5 }); // 5分钟过期
    const res = {
      code: 200,
      mes: "success",
      data: "验证码已发送",
    };
    generateLog(request, res);
    return NextResponse.json(res);
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(request), toObj(error));
    const res = { code: 500, data: null, mes: message };
    generateLog(request, res);
    return NextResponse.json(res);
  }
}
