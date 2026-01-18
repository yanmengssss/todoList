import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import parser from "xml2js";
import { request } from "./request";
import redis from "./db/redis";

export interface JwtPayload {
  id: number;
  type: "at" | "rt";
  iat: number; // 签发时间
  exp: number; // 过期时间
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toObj<T>(data: T): object {
  return JSON.parse(JSON.stringify(data));
}

export function getReqInfo(req: Request): object {
  return {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  };
}

export function compareArray(inputList: string[], tagList: string[]) {
  const list = inputList.filter((item) => !tagList.includes(item)); //并且去重
  const res: string[] = [];
  new Set(list).forEach((item) => {
    res.push(item);
  });
  return res;
}

export function getTime(data: Date) {
  return dayjs(new Date(data).toLocaleString()).format("YYYY-MM-DD HH:mm:ss");
}

export function deepClone<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj !== "object") {
    return obj;
  }
  const cloneObj: any = Array.isArray(obj)
    ? []
    : Object.create(Object.getPrototypeOf(obj));
  Object.keys(obj).forEach((key) => {
    cloneObj[key] = deepClone(obj[key]);
  });
  return cloneObj as T;
}

export function getRandoCode(length: number, type: "number" | "string" = 'string') {
  // 生成随机验证码,要26字母+大小写随机+数字
  const characters = type === 'string' ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" : "0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// 使用jwt生成token
export const generateToken = (id: number, type: "at" | "rt" = "at") => {
  // 1. 必须使用环境变量存储密钥，不可硬编码在代码中
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  // 2. 建议设置过期时间（如 30天）atk 5h,rtk 15d
  return jwt.sign({ id, type }, secret, {
    expiresIn: type === "at" ? "5h" : "15d",
  });
};

export const decodeToken = (token: string): JwtPayload | null => {
  const decoded = jwt.decode(token);
  return decoded as JwtPayload | null;
};
export const signSHA1 = (signature, timestamp, nonce) => {
  const tmpArr = [process.env.WX_KEY, timestamp, nonce];
  tmpArr.sort();

  const tmpStr = tmpArr.join("");
  const hash = crypto.createHash("sha1").update(tmpStr).digest("hex");
  return hash === signature;
};

export const getAccessToken = () => {
  const options = {
    method: "GET",
    url: "https://api.weixin.qq.com/cgi-bin/token",
    params: {
      grant_type: "client_credential",
      appid: "wxba526ecb8afb26d1",
      secret: "1987cdbadc40fd562ef6b3b9865aac11",
    },
    headers: { "content-type": "application/json" },
  };

  return request(options);
};

export function parseXmlAsync(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export const getWXToken = async () => {
  const cached = await redis.get("wechat:access_token");
  if (cached) return cached;
  const response = await getAccessToken();
  console.log(response);
  const access_token = (response as any).access_token;
  await redis.set("wechat:access_token", access_token, { ex: 7200 });
  return access_token;
};


export const sendTemplateMessage = async (openid) => {
  const access_token = await getWXToken();
  const options = {
    method: 'POST',
    url: 'https://api.weixin.qq.com/cgi-bin/message/template/send',
    params: { access_token: access_token },
    headers: { 'content-type': 'application/json' },
    data: {
      touser: openid,
      template_id: "kbKL9YeETabVyP5MmcS19mm58RMMLGBau1lg-b_284g",
      data: {}
    }
  };
  request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });

}
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;

  const hasNumber = /[0-9]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const charTypes = [hasNumber, hasUpperCase, hasLowerCase, hasSpecialChar].filter(Boolean).length;
  return charTypes >= 3;
};