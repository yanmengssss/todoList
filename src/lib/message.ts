import nodemailer from "nodemailer";
const formEmail = "2799484803@qq.com";
const pass = "wsiqrgeqdmmqdgbj";

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  service: "qq", // 邮箱服务商，例如 'qq', 'gmail', '163'
  auth: {
    user: formEmail,
    pass: pass, // 必须是授权码，而非邮箱密码
  },
});

const titleList = {
  register: "注册账号",
  forgot: "找回密码",
  login: "登录",
};
export type messageTypeList = keyof typeof titleList;
// 发送邮件
export async function sendMail(
  to: string,
  type: messageTypeList,
  text: string
) {
  const info = await transporter.sendMail({
    from: `"Life Pilot" <${formEmail}>`,
    to: to,
    subject: titleList[type],
    text: text,
  });
  return info;
}
