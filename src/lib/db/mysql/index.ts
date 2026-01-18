import { CreateTaskType, UserType } from "@/store/interface";
import { prisma } from "./sql";
import { randomUUID } from "crypto";
// npx prisma db push --schema=./prisma-mysql/schema.prisma
// npx prisma generate --schema=./prisma-mysql/schema.prisma
//新建任务
export const createTask = async (task: CreateTaskType) => {
  const { title, description, priority, endAt, favorite, tags = [] } = task;
  const result = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      endAt,
      tags,
      favorite,
      userId: 1,
      status: "doing",
    },
  });
  return result;
};

//创建用户
export const createUser = async (user: UserType) => {
  const result = await prisma.user.create({
    data: {
      name: user.name || "",
      phone: user.phone || "",
      password: user.password || "",
      email: user.email || "",
      avatar: user.avatar || "",
      githubID: user.githubID || "",
      googleID: user.googleID || "",
      wxID: user.wxID || "",
      userID: randomUUID(),
    },
  });
  return result;
};

// 查找用户
export const getUser = async ({
  email,
  phone,
  id,
}: {
  email?: string;
  phone?: string;
  id?: number;
}) => {
  const result = await prisma.user.findFirst({
    where: {
      email,
      phone,
      id,
    },
  });
  return result;
};
