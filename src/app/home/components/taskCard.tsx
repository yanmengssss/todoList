"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import {
  statusList,
  defaultStatus,
  priorityList,
  defaultPriority,
  defaultTagColor,
} from "@/lib/common/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskType } from "@/store/interface";
import { Star } from "lucide-react";
import { getTime } from "@/lib/utils";
import { tagsStore, taskStore } from "@/store";
import { TaskDialog } from "./taskDialog";

type Props = {
  task: TaskType;
};

export function TaskCard({ task }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteTask = (id: string) => {
    taskStore.deleteTask(id);
  };
  const {
    id,
    title,
    description,
    tags,
    status,
    priority,
    createdAt,
    endAt,
    favorite,
  } = task;
  return (
    <Card key={id} className=" w-[350px]">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>{title}</CardTitle>
          <Star
            className="ml-2 w-5 h-5"
            color={favorite ? "#e21818" : undefined}
          />
        </div>

        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button
            className="mr-1"
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            详情
          </Button>
          <Button onClick={() => deleteTask(id)}>删除</Button>
        </CardAction>
      </CardHeader>
      <CardContent className="mb-0">
        <div className="flex gap-2">
          <Badge
            style={{
              backgroundColor: statusList[status || defaultStatus].color,
            }}
          >
            {statusList[status || defaultStatus].label}
          </Badge>
          <Badge
            style={{
              backgroundColor: priorityList[priority || defaultPriority].color,
            }}
          >
            {priorityList[priority || defaultPriority].label}
          </Badge>
          <div className="text-xs text-black font-normal">
            <div>创建时间:{getTime(createdAt)}</div>
            <div>结束时间:{getTime(endAt)}</div>
          </div>
        </div>
        <div className="mt-2 overflow-x-auto w-full">
          {tags &&
            tags.map((tagId: number) => {
              const tag = tagsStore.tags.find((tag) => tag.id === tagId);
              if (tag)
                return (
                  <Badge
                    className={`text-black border-gray-300 min-w-[50px] h-[30px] mr-2`}
                    style={{ backgroundColor: tag?.color || defaultTagColor }}
                    key={tag?.id}
                  >
                    {tag?.text || ""}
                  </Badge>
                );
            })}
        </div>
      </CardContent>
      <TaskDialog task={task} open={dialogOpen} onOpenChange={setDialogOpen} />
    </Card>
  );
}
