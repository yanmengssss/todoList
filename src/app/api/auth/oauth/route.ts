import { createUser, getUser } from "@/lib/db/mysql";
import { generateToken } from "@/lib/utils";
import { ProxyAgent, fetch as undiciFetch } from "undici";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/mysql/sql";
// ouath请求换取用户信息
export async function POST(request: Request) {
  const { token } = await request.json();

  // 配置代理（如果环境变量中有代理配置）
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

  const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`;

  let googleRes;
  if (proxyUrl) {
    const agent = new ProxyAgent(proxyUrl);
    googleRes = await undiciFetch(url, { dispatcher: agent });
  } else {
    googleRes = await fetch(url);
  }

  const userInfo = await googleRes.json();
  let isNewUser = false;
  // 先按 email 查找用户
  let user = await prisma.user.findFirst({
    where: {
      email: userInfo.email,
    },
  });

  if (!user) {
    // 用户不存在，创建新用户
    user = await createUser({
      email: userInfo.email,
      name: userInfo.name,
      googleID: userInfo.sub,
      avatar: userInfo.picture,
    });
    isNewUser = true;
  } else if (!user.googleID) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleID: userInfo.sub },
    });
  }

  const atk = generateToken(user.id);
  const rtk = generateToken(user.id, "rt");
  // 1️⃣ 先创建 response
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
