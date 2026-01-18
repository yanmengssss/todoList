import redis from "@/lib/db/redis";
import { parseXmlAsync, sendTemplateMessage, signSHA1 } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    // 从 URL 里取 query 参数
    const { searchParams } = new URL(request.url);

    const signature = searchParams.get("signature");
    const timestamp = searchParams.get("timestamp");
    const nonce = searchParams.get("nonce");
    const echostr = searchParams.get("echostr");

    if (!signature || !timestamp || !nonce || !echostr) {
      return new Response("参数缺失", { status: 400 });
    }

    if (signSHA1(signature, timestamp, nonce)) {
      // 等价于 res.send(echostr)
      return new Response(echostr);
    } else {
      console.error("加密字符串不等于微信返回字符串，验证失败！！！");
      return new Response("验证失败！", { status: 403 });
    }
  } catch (error) {
    return new Response(`微信服务器配置验证出现异常: ${String(error)}`, {
      status: 500,
    });
  }
}
//扫描接收有无人登录
export async function POST(request: Request) {
  try {
    // 1️⃣ 读取 XML
    const xml = await request.text();

    // 2️⃣ 解析 XML
    const result = await parseXmlAsync(xml);

    // 3️⃣ 业务逻辑
    if (result?.xml?.Ticket) {
      const createTime = result.xml.CreateTime[0];
      const openId = result.xml.FromUserName[0];
      const scene = result.xml.EventKey[0];
      console.log(createTime, openId, scene);
      const is = await redis.get(`wx:code:${scene}`)
      if (is) {
        const [state, count] = (is as string).split("-");
        if (count === "0") {
          await redis.set(`wx:code:${scene}`, `${state}-1-${openId}`, { ex: 604800 });
          sendTemplateMessage(openId);
          return new Response("success", { status: 200 });
        }
      }
      return new Response("error", { status: 400 });
    }

    // 4️⃣ 等价于 res.send('success')
    return new Response("success", { status: 200 });
  } catch (error) {
    console.error("处理微信 POST 事件失败:", error);
    return new Response("error", { status: 500 });
  }
}
