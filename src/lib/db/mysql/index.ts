import { CreateTaskType } from "@/store/interface";
import { prisma } from "./sql";

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
