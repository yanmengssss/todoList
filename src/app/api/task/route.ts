import { trackError } from "@/lib/db/mongo";
import { createTask } from "@/lib/db/mysql";
import { prisma } from "@/lib/db/mysql/sql";
import { getReqInfo, toObj } from "@/lib/utils";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    const tasks = await prisma.task.findMany();
    return NextResponse.json({
      code: 200,
      data: tasks,
      mes: "success",
    });
  } catch (error) {
    trackError(toObj(req), toObj(error));
    const { message = "" } = error as Error;
    return NextResponse.json({
      code: 500,
      data: null,
      mes: message,
    });
  }
}

// 创建任务
export async function PUT(req: Request) {
  const body = await req.json();
  try {
    const task = await createTask(body);
    return NextResponse.json({
      code: 200,
      data: task,
      mes: "success",
    });
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({
      code: 500,
      data: null,
      mes: message,
    });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  try {
    await prisma.task.delete({
      where: { id: body.id },
    });
    return NextResponse.json({
      code: 200,
      data: null,
      mes: "success",
    });
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const task = await prisma.task.update({
      where: { id: body.id },
      data: body,
    });
    return NextResponse.json({
      code: 200,
      data: task,
      mes: "success",
    });
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}
