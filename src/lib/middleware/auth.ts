// middleware/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "../utils";
import { prisma } from "../db/mysql/sql";

/**
 * 只校验：
 * 1. 是否存在 token
 * 2. token 是否过期
 */
export async function withAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  // 1. 是否携带 Token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "未登录", code: 401, data: null },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    // 2. 校验签名 + 是否过期
    const res = decodeToken(token);
    // 如果过期了
    if (!res || res?.exp < Date.now() / 1000) {
      return NextResponse.json(
        { message: "未登录", code: 401, data: null },
        { status: 401 }
      );
    }
    if (!res?.id) {
      return NextResponse.json(
        { message: "未登录", code: 401, data: null },
        { status: 401 }
      );
    }
    const user = await prisma.user.findFirst({
      where: {
        userID: String(res.id)
      },
    });
    if (!user) {
      return NextResponse.json(
        { message: "未登录", code: 401, data: null },
        { status: 401 }
      );
    } else {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", String(user.userID));
      return NextResponse.next();
    }
  } catch {
    return NextResponse.json(
      { message: "未登录", code: 401, data: null },
      { status: 401 }
    );
  }
}

/**
 * 获取认证用户信息
 * 用于在路由处理函数中获取当前登录用户
 */
export async function getAuthUser(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "未登录", code: 401, data: null },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const res = decodeToken(token);
    if (!res || res?.exp < Date.now() / 1000 || !res?.id) {
      return NextResponse.json(
        { message: "未登录", code: 401, data: null },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        userID: String(res.id)
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "未登录", code: 401, data: null },
        { status: 401 }
      );
    }

    return { userId: String(user.userID) };
  } catch {
    return NextResponse.json(
      { message: "未登录", code: 401, data: null },
      { status: 401 }
    );
  }
}

/**
 * 高阶函数：包装路由处理函数，自动进行认证验证
 * 使用方式：
 * export const POST = withAuthHandler(async (req, userId) => {
 *   // userId 是当前登录用户的ID
 *   // 你的业务逻辑
 * });
 */
export function withAuthHandler(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await getAuthUser(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    return handler(req, authResult.userId);
  };
}
