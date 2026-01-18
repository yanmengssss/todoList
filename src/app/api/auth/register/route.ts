import { prisma } from "@/lib/db/mysql/sql";
import redis from "@/lib/db/redis";
import { createUser } from "@/lib/db/mysql";
import { generateToken, validatePassword } from "@/lib/utils";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { type, email, password, rePassword, otp } = await request.json();

  // 验证密码长度
  if (password.length < 8) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "密码至少需要 8 位",
    });
  }

  // 验证密码复杂度
  if (!validatePassword(password)) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "密码必须至少包含三种字符类型（数字、大写字母、小写字母、特殊字符）",
    });
  }

  // 验证密码和确认密码是否一致
  if (password !== rePassword) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "两次输入的密码不一致",
    });
  }

  // 验证 OTP
  const sendOtp = await redis.get(type + "-" + email + "-register");
  if (String(otp) !== String(sendOtp)) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "验证码错误",
    });
  }

  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (existingUser) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "该邮箱已被注册",
    });
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 删除已使用的 OTP
  await redis.del(type + "-" + email + "-register");

  // 创建用户
  const user = await createUser({
    email: email,
    password: hashedPassword,
  });

  // 生成 token
  const atk = generateToken(user.id);
  const rtk = generateToken(user.id, "rt");

  const res = NextResponse.json({
    code: 200,
    data: {
      atk,
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
}
