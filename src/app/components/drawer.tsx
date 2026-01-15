"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, CirclePlus, Clock3, Loader2Icon, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import dayjs from "dayjs";
import { getOptions, stream } from "@/lib/stream";
import { useState, useRef } from "react";
import { MarkDown } from "./markDown";
import { uiStore } from "@/store/ui";
type MessageListType = {
  time: number;
  content: string;
  role: "user" | "ai";
};
const AICard = ({ content, time }: { content: string; time: number }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
        AI
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <div className="text-sm text-gray-900 dark:text-gray-100 prose prose-sm dark:prose-invert max-w-none">
            <MarkDown content={content}></MarkDown>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block ml-1">
          {time ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : "AI回答中..."}
        </span>
      </div>
    </div>
  );
};

const UserCard = ({ content, time }: { content: string; time: number }) => {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 flex flex-col items-end">
        <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <p className="text-sm">{content}</p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block mr-1">
          {dayjs(time).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
        我
      </div>
    </div>
  );
};

const defaultComment = "AI正在思考中...";
const defaultRecommendQuestionList = [
  "今天有什么重要的事情要做？",
  "帮我制定一个旅游计划",
  "最近的工作进度如何？",
];
type StatusType = "thinking" | "answer" | "error" | "normal";
export const Drawer = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [messagesList, setMessagesList] = useState<MessageListType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [nowAnswer, setNowAnswer] = useState<string>("");
  const nowAnswerRef = useRef<string>("");
  const [status, setStatus] = useState<StatusType>("normal");
  const [recommendQuestionList, setRecommendQuestionList] = useState<string[]>(
    defaultRecommendQuestionList
  );
  const handleSend = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    const userMessage = inputValue;
    if (!currentTitle) {
      setCurrentTitle(userMessage);
    }
    setMessagesList((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        time: new Date().getTime(),
      },
    ]);
    setInputValue("");
    setNowAnswer(defaultComment);
    nowAnswerRef.current = defaultComment;
    setStatus("thinking");
    const questionList: string[] = [];
    stream(
      "/v3/chat",
      getOptions("123456789", userMessage),
      ({ data, done }) => {
        if (done) {
          setIsLoading(false);
          const finalContent = nowAnswerRef.current;
          if (finalContent && finalContent !== defaultComment) {
            setMessagesList((prev) => [
              ...prev,
              {
                role: "ai",
                content: finalContent,
                time: new Date().getTime(),
              },
            ]);
          }
          setNowAnswer("");
          nowAnswerRef.current = "";
          setStatus("normal");
          setRecommendQuestionList(questionList);
          return;
        }

        data.split("\ndata:").forEach((item: string) => {
          if (!item.startsWith("event:")) {
            try {
              const data = JSON.parse(
                item.trim().replace("data:", "").split("event:")[0]
              );
              console.log(data.content, data.type);
              if (data.type === "answer") {
                setStatus((currentStatus) => {
                  if (currentStatus === "thinking") {
                    setNowAnswer("");
                    nowAnswerRef.current = "";
                    return "answer";
                  }
                  return currentStatus;
                });

                if (data.time_cost) {
                  nowAnswerRef.current = data.content;
                  setNowAnswer(data.content);
                } else {
                  // 否则是增量内容，追加
                  setNowAnswer((prev) => {
                    const baseContent = prev === defaultComment ? "" : prev;
                    const newValue = baseContent + data.content;
                    nowAnswerRef.current = newValue;
                    return newValue;
                  });
                }
              }
              if (data.type === "follow_up") {
                questionList.push(data.content);
              }
            } catch (error) {
              console.error("解析SSE数据失败:", error);
            }
          }
        });
      }
    );
  };
  return (
    <Card className="w-[400px] fixed top-[30px] right-[30px] h-[750px] z-50 flex flex-col overflow-hidden pb-0">
      <CardHeader className="border-b-2 flex-shrink-0">
        <div className="flex items-center justify-between ">
          <CardTitle className="truncate w-24">
            {currentTitle || "新对话"}
          </CardTitle>
          <div className="flex gap-2">
            <CirclePlus className="size-4 cursor-pointer hover:opacity-60" />
            <Clock3 className="size-4 cursor-pointer hover:opacity-60" />
            <X
              className="size-4 cursor-pointer hover:opacity-60"
              onClick={() => uiStore.setIsDrawerOpen(false)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messagesList.map((item, index) => {
            return item.role === "user" ? (
              <UserCard key={index} content={item.content} time={item.time} />
            ) : (
              <AICard key={index} content={item.content} time={item.time} />
            );
          })}
          {(status === "answer" || status === "thinking") && (
            <AICard content={nowAnswer} time={0} />
          )}
        </div>
        {recommendQuestionList.length > 0 && !isLoading && (
          <div className="px-4 pt-2 pb-2 flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              推荐问题：
            </p>
            <div className="flex flex-col gap-2">
              {recommendQuestionList.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="text-left text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex-shrink-0 p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <InputGroup>
            <InputGroupTextarea
              placeholder="请输入问题"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <InputGroupAddon align="block-end">
              <div className="w-full flex justify-end">
                <InputGroupButton
                  variant="default"
                  className="rounded-full "
                  size="icon-xs"
                  disabled={isLoading}
                  onClick={handleSend}
                >
                  {isLoading ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <ArrowUpIcon />
                  )}
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </div>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  );
};
