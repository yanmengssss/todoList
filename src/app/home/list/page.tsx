"use client";
import { observer } from "mobx-react-lite";
import { taskStore } from "@/store";
import { useEffect } from "react";
import WithoutTask from "../components/withoutTask";
import { TaskCard } from "../components/taskCard";

const ListPage = observer(() => {
  const { taskList, getTasks } = taskStore;

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  return (
    <div className="flex-1">
      {taskList.length === 0 ? (
        <WithoutTask />
      ) : (
        <div className="overflow-y-auto max-h-[75vh] flex-wrap flex gap-4 mt-5">
          {taskList.map((item) => (
            <TaskCard key={item.id} task={item} />
          ))}
        </div>
      )}
    </div>
  );
});

export default ListPage;
