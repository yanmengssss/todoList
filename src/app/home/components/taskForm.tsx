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

import { format } from "date-fns";
import { tagsStore, taskStore } from "@/store";
import { CreateTaskType } from "@/store/interface";
import { TagsSelect } from "./tagsSelect";
import { defaultPriority, priorityList } from "@/lib/common/data";

// 1. 定义表单验证规则
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.number().int().optional(),
  endAt: z.date().optional(),
  favorite: z.boolean().optional(),
  tags: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskForm({ onChange }: { onChange: (open: boolean) => void }) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: defaultPriority,
      endAt: undefined,
      favorite: false,
      tags: "",
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    const data = {
      ...values,
      tags: values["tags"]
        ?.split("/")
        .map((tag) => tagsStore.idMap.get(tag) || -1)
        .filter((id) => id !== -1),
    };
    const res = await taskStore.createTask(data as CreateTaskType);
    if (res) {
      onChange(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter description" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={field.value?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityList.map((item) => {
                    return (
                      <SelectItem key={item.val} value={String(item.val)}>
                        {item.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>请选择标签</FormLabel>
              <TagsSelect onChange={field.onChange} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="favorite"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormLabel className="font-normal">Favorite</FormLabel>
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
              <FormLabel>End At</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full text-left">
                    {field.value ? format(field.value, "PPP") : "Select date"}
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
        <div className="flex justify-end w-full gap-2 mr-1">
          <Button type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
