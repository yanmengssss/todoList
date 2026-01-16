import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = "todoList_ye";
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

export function getRandoCode(length: number) {
  // 生成随机验证码,要26字母+大小写随机
  const code = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  return code;
}

// 使用jwt生成token
export const generateToken = (id: number, type: "at" | "rt" = "at") => {
  // 1. 必须使用环境变量存储密钥，不可硬编码在代码中
  const secret = JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  // 2. 建议设置过期时间（如 30天）
  return jwt.sign({ id, type }, secret, {
    expiresIn: "30d",
  });
};
