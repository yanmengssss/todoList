import { prisma } from "@/lib/db/mysql/sql";
import redis from "@/lib/db/redis";
import { createUser } from "@/lib/db/mysql";
import { generateToken } from "@/lib/utils";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { type, email, password, otp } = await request.json();
  const sendOtp = await redis.get(type + "-" + email + '-login');
  if (type === "email") {
    if (String(otp) !== String(sendOtp)) {
      return NextResponse.json({
        code: 400,
        data: null,
        message: "验证码错误",
      });
    } else {
      await redis.del("login-" + email);
      let isNewUser = false;
      let user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (!user) {
        user = await createUser({
          email: email,
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
        maxAge: 60 * 60 * 24 * 15, // 7 天
      });

      return res;
    }
  } else {

  }
}
