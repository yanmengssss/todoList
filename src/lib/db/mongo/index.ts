//插入埋点数据
import { ErrorOperate, LogOperate } from "./model";
import { connectDB } from "./monogb";
connectDB();
export const trackError = async (data: object, error: object) => {
  const result = await ErrorOperate.create({ data, error });
  return result;
};

export const generateLog = (req, res) => {
  LogOperate.create(req, res);
};
