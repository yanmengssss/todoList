import { prisma } from "@/lib/db/mysql/sql";
import redis from "@/lib/db/redis";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/utils";


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
  const sendOtp = await redis.get(type + "-" + email + "-forgot");
  if (String(otp) !== String(sendOtp)) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "验证码错误",
    });
  }

  // 检查用户是否存在
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "该邮箱未注册",
    });
  }

  // 加密新密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 删除已使用的 OTP
  await redis.del(type + "-" + email + "-forgot");

  // 更新用户密码
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return NextResponse.json({
    code: 200,
    data: null,
    message: "密码重置成功",
  });
}
