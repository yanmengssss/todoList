import { trackError } from "@/lib/db/mongo";
import { prisma } from "@/lib/db/mysql/sql";
import { toObj } from "@/lib/utils";
import { TagType } from "@/store/interface";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    const tag = await prisma.tags.findMany();
    return NextResponse.json({ code: 200, data: tag, mes: "success" });
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const newTags = await Promise.all(
      body.map((item: any) =>
        prisma.tags.create({
          data: item,
        })
      )
    );
    return NextResponse.json({ code: 200, data: newTags, mes: "success" });
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}
//批量根据ID进行修改
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updatePromises = body.map((item: TagType) =>
      prisma.tags.update({
        where: { id: item.id },
        data: { text: item.text, color: item.color },
      })
    );

    await Promise.all(updatePromises);

    const tag = await prisma.tags.findMany();
    return NextResponse.json({ code: 200, data: tag, mes: "success" });
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.tags.deleteMany({
      where: {
        id: {
          in: id,
        },
      },
    });
    const tag = await prisma.tags.findMany();
    return NextResponse.json({ code: 200, data: tag, mes: "success" });
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(req), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}
