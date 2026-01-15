import { makeAutoObservable } from "mobx";
import { CreateTaskType, TaskType } from "./interface";
import { request } from "@/lib/request";
class TaskStore {
  taskList: TaskType[] = [];

  constructor() {
    // 自动把属性变 observable，把方法变 action
    makeAutoObservable(this);
  }

  setTaskList = (taskList: TaskType[]) => {
    this.taskList = [...taskList];
  };

  getTasks = async () => {
    try {
      const res = await request<TaskType[]>({ url: "/api/task" });
      if (res.code === 200) {
        this.setTaskList(res.data);
      } else {
        this.setTaskList([]);
      }
    } catch (error) {
      console.error("获取任务失败:", error);
    }
  };

  createTask = async (data: CreateTaskType) => {
    try {
      const res = await request<CreateTaskType>({
        url: "/api/task",
        method: "PUT",
        data,
      });
      if (res.code === 200) {
        this.getTasks();
        return true;
      }
    } catch (error) {
      console.error("创建任务失败:", error);
      return false;
    }
  };

  deleteTask = async (id: string) => {
    try {
      const res = await request({
        url: "/api/task",
        method: "DELETE",
        data: { id },
      });
      if (res.code === 200) {
        this.getTasks();
        return true;
      }
    } catch (error) {
      console.error("删除任务失败:", error);
      return false;
    }
  };

  updateTask = async (
    id: string,
    data: Partial<CreateTaskType> & { status?: string; tags?: number[] }
  ) => {
    try {
      const res = await request({
        url: "/api/task",
        method: "POST",
        data: { id, ...data },
      });
      if (res.code === 200) {
        this.getTasks();
        return true;
      }
    } catch (error) {
      console.error("更新任务失败:", error);
      return false;
    }
  };
}

export const taskStore = new TaskStore();
