import { prisma } from "@/lib/db/mysql/sql";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/utils";
import { withAuthHandler } from "@/lib/middleware/auth";

export const POST = withAuthHandler(async (request: NextRequest, userId: string) => {
    try {
        const { password, email } = await request.json();

        // 验证必填字段
        if (!password || !email) {
            return NextResponse.json({
                code: 400,
                message: "密码和邮箱不能为空",
                data: null,
            }, {
                status: 400,
            });
        }

        // 验证密码长度
        if (password.length < 8) {
            return NextResponse.json({
                code: 400,
                message: "密码至少需要 8 位",
                data: null,
            }, {
                status: 400,
            });
        }

        // 验证密码复杂度
        if (!validatePassword(password)) {
            return NextResponse.json({
                code: 400,
                message: "密码必须至少包含三种字符类型（数字、大写字母、小写字母、特殊字符）",
                data: null,
            }, {
                status: 400,
            });
        }

        // 检查用户是否存在
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            return NextResponse.json({
                code: 400,
                message: "用户不存在",
                data: null,
            }, {
                status: 400,
            });
        }

        // 验证当前用户是否有权限修改该邮箱的密码
        if (user.userID !== userId) {
            return NextResponse.json({
                code: 400,
                message: "用户错误",
                data: null,
            }, {
                status: 403,
            });
        }

        // 加密新密码（使用异步方法）
        const hashedPassword = await bcrypt.hash(password, 10);

        // 更新用户密码
        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            code: 200,
            message: "密码设置成功",
            data: null,
        });
    } catch (error) {
        console.error("设置密码失败:", error);
        return NextResponse.json({
            code: 500,
            message: "设置密码失败，请稍后重试",
            data: null,
        }, {
            status: 500,
        });
    }
});