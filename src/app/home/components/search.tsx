"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskForm } from "./taskForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
const FormDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增待办</DialogTitle>
        </DialogHeader>
        <TaskForm onChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default function Search() {
  const [open, setOpen] = useState(false);
  const handleCreateTask = () => {
    setOpen(true);
  };
  return (
    <>
      <FormDialog open={open} setOpen={setOpen} />
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="搜索任务..."
              className="pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            搜索
          </Button>
        </div>
        <Button
          type="button"
          variant="default"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 border-0 px-6"
          onClick={handleCreateTask}
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新增任务
          </span>
        </Button>
      </div>
    </>
  );
}
