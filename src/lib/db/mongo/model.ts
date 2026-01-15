import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const ErrorSchema = new Schema({
  data: Object,
  error: Object,
  createdAt: { type: Date, default: Date.now },
});

// 日志
export const LogOperateSchema = new Schema({
  request: Object,
  Response: Object,
  createdAt: { type: Date, default: Date.now },
});
export const ErrorOperate =
  mongoose.models.ErrorLog || mongoose.model("ErrorLog", ErrorSchema);

export const LogOperate =
  mongoose.models.LogOperate || mongoose.model("LogOperate", LogOperateSchema);
