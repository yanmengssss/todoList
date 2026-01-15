import mongoose from "mongoose";

// MongoDB 地址
const url = process.env.MONGODB_DATABASE_URL as string;

// 在 globalThis 上挂一个缓存，避免开发环境热更新重复连接
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    console.log("开始连接 MongoDB...");
    cached.promise = mongoose.connect(url, {
      connectTimeoutMS: 3000,
      socketTimeoutMS: 4500,
    });
  }
  try {
    cached.conn = await cached.promise;
    console.log("MongoDB 连接成功");
  } catch (error) {
    cached.promise = null; // 下次还能重试
    console.error("MongoDB 连接失败:", error);
    // throw error;
  }
  return cached.conn;
}
