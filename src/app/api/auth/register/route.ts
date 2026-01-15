import { trackError } from "@/lib/db/mongo";
import redis from "@/lib/db/redis";
import { sendMail } from "@/lib/message";
import { getRandoCode, toObj } from "@/lib/utils";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();
  } catch (error) {
    const { message = "" } = error as Error;
    trackError(toObj(request), toObj(error));
    return NextResponse.json({ code: 500, data: null, mes: message });
  }
}
