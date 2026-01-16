import { createUser, getUser } from "@/lib/db/mysql";
import { generateToken } from "@/lib/utils";

import { NextResponse } from "next/server";
// ouath请求换取用户信息
export async function POST(request: Request) {
  const { token } = await request.json();
  const googleRes = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
  );
  const userInfo = await googleRes.json();
  const user = await getUser({ email: userInfo.email });
  console.log(user);
  let atk = "";
  let rtk = "";
  if (!user) {
    // 注册
    const res = await createUser({
      email: userInfo.email,
    });
    console.log(res);
    atk = generateToken(res.id);
    rtk = generateToken(res.id, "rt");
  } else {
    atk = generateToken(user.id);
    rtk = generateToken(user.id, "rt");
  }
  return NextResponse.json({
    code: 200,
    atk: atk,
    rtk: rtk,
    message: "登录成功",
  });
}
