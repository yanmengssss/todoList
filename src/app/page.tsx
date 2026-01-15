import { redirect } from "next/navigation";

export default function Page() {
  //自动重定向到/home
  redirect("/home");
  // 重定向逻辑已移至 middleware.ts
  return <div>正在重定向...</div>;
}
