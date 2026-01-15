"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { tagsStore, taskStore } from "@/store";
import { TaskType } from "@/store/interface";
import { TagsSelect } from "./tagsSelect";
import {
  defaultPriority,
  priorityList,
  statusList,
  defaultStatus,
  defaultTagColor,
} from "@/lib/common/data";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { getTime } from "@/lib/utils";

// 定义表单验证规则
const taskFormSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  status: z.string().optional(),
  endAt: z.date().optional(),
  favorite: z.boolean().optional(),
  tags: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type Props = {
  task: TaskType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDialog({ task, open, onOpenChange }: Props) {
  const [isEditMode, setIsEditMode] = React.useState(false);

  // 将 tags 数组转换为字符串格式（用 "/" 分隔）
  const getTagsString = (tags: number[]): string => {
    if (!tags || tags.length === 0) return "";
    return tags
      .map((tagId) => {
        const tag = tagsStore.tags.find((t) => t.id === tagId);
        return tag?.text || "";
      })
      .filter((text) => text !== "")
      .join("/");
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: defaultPriority,
      status: defaultStatus,
      endAt: undefined,
      favorite: false,
      tags: "",
    },
  });

  // 当任务变化时，更新表单默认值
  React.useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority ?? defaultPriority,
        status: task.status || defaultStatus,
        endAt: task.endAt ? new Date(task.endAt) : undefined,
        favorite: task.favorite || false,
        tags: getTagsString(task.tags || []),
      });
      setIsEditMode(false);
    }
  }, [task, form]);

  const onSubmit = async (values: TaskFormValues) => {
    if (!task) return;

    const data = {
      ...values,
      tags: values.tags
        ?.split("/")
        .map((tag) => tagsStore.idMap.get(tag) || -1)
        .filter((id) => id !== -1),
    };

    const res = await taskStore.updateTask(task.id, data);
    if (res) {
      setIsEditMode(false);
      onOpenChange(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? "编辑任务" : "任务详情"}
            {task.favorite && (
              <Star className="w-5 h-5" color="#e21818" fill="#e21818" />
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "修改任务信息后点击保存"
              : "查看任务详细信息，点击编辑按钮进行修改"}
          </DialogDescription>
        </DialogHeader>

        {isEditMode ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入标题" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入描述" {...field} rows={4} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusList).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>优先级</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择优先级" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityList.map((item) => (
                          <SelectItem key={item.val} value={String(item.val)}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <TagsSelect onChange={field.onChange} value={field.value} />
                  </FormItem>
                )}
              />

              {/* Favorite */}
              <FormField
                control={form.control}
                name="favorite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormLabel className="font-normal">收藏</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* EndAt */}
              <FormField
                control={form.control}
                name="endAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>结束时间</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full text-left">
                          {field.value
                            ? format(field.value, "PPP")
                            : "选择日期"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-500">标题</label>
              <p className="mt-1 text-base">{task.title}</p>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  描述
                </label>
                <p className="mt-1 text-base whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Status and Priority */}
            <div className="flex gap-2 items-center">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  状态
                </label>
                <div className="mt-1">
                  <Badge
                    style={{
                      backgroundColor:
                        statusList[task.status || defaultStatus].color,
                    }}
                  >
                    {statusList[task.status || defaultStatus].label}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  优先级
                </label>
                <div className="mt-1">
                  <Badge
                    style={{
                      backgroundColor:
                        priorityList[task.priority || defaultPriority].color,
                    }}
                  >
                    {priorityList[task.priority || defaultPriority].label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  标签
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {task.tags.map((tagId: number) => {
                    const tag = tagsStore.tags.find((t) => t.id === tagId);
                    return (
                      <Badge
                        key={tagId}
                        className="text-black border-gray-300"
                        style={{
                          backgroundColor: tag?.color || defaultTagColor,
                        }}
                      >
                        {tag?.text || ""}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  创建时间
                </label>
                <p className="mt-1 text-sm text-gray-700">
                  {getTime(task.createdAt)}
                </p>
              </div>
              {task.endAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    结束时间
                  </label>
                  <p className="mt-1 text-sm text-gray-700">
                    {getTime(task.endAt)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                关闭
              </Button>
              <Button type="button" onClick={() => setIsEditMode(true)}>
                编辑
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
