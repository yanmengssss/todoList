import { trackError } from "@/lib/db/mongo";
import { createUser } from "@/lib/db/mysql";
import { prisma } from "@/lib/db/mysql/sql";
import redis from "@/lib/db/redis";
import { request } from "@/lib/request";
import { generateToken, getWXToken, toObj } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const access_token = await getWXToken();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
      return NextResponse.json({ code: 400, mes: "code is required" });
    }
    const options = {
      method: "POST",
      url: "https://api.weixin.qq.com/cgi-bin/qrcode/create",
      params: {
        access_token: access_token,
      },
      headers: { "content-type": "application/json" },
      data: {
        expire_seconds: 600, //有效时间 五分钟
        action_name: "QR_STR_SCENE", //类型
        action_info: { scene: { scene_str: code } }, //场景值
      },
    };
    const response: any = await request(options);
    await redis.set(`wx:code:${code}`, `${state}-0`, { ex: 600 });
    return NextResponse.json({
      code: 200,
      mes: "success",
      data: response,
    });
  }
  catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}


export async function POST(req: Request) {
  try {
    const { code, state } = await req.json();
    const isLogin = await redis.get(`wx:code:${code}`);
    if (!isLogin || typeof isLogin !== "string") {
      return NextResponse.json({ code: 401, mes: "without login", data: null });
    }
    const [st, status, openId] = isLogin.split("-");
    if (st === state && status === "1") {
      redis.del(`wx:code:${code}`);
      let isNewUser = false;
      let user = await prisma.user.findFirst({
        where: {
          wxID: openId,
        },
      })
      if (!user) {
        user = await createUser({
          wxID: openId,
        });
        isNewUser = true;
      }
      const atk = generateToken(user.id);
      const rtk = generateToken(user.id, "rt");
      const res = NextResponse.json({
        code: 200,
        data: {
          isNewUser,
          atk, // 👈 atk 返回给前端
        },
        message: "登录成功",
      });

      // 2️⃣ 在 response 上设置 cookie
      res.cookies.set("rtk", rtk, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 天
      });

      return res;
    } else {
      return NextResponse.json({ code: 400, mes: "without login", data: null });
    }
  }
  catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}