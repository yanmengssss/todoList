"use client";
import * as React from "react";
import { CalendarSelf as Calendar } from "./calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChromePicker } from "react-color";
import { Badge } from "@/components/ui/badge";
import { Airplay, AlarmClockPlus, Check, Star } from "lucide-react";
import { tagsStore } from "@/store";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TagType } from "@/store/interface";
import { defaultTagColor } from "@/lib/common/data";
import { deepClone } from "@/lib/utils";
type DialogType = "add" | "change" | "normal";
const TagDialog = ({ show, onChange, defaultTag }) => {
  const { addTags, deleteTag, getTags, batchUpdateTags } = tagsStore;
  const [color, setColor] = useState(defaultTagColor);
  const [text, setText] = useState("");
  const [selectId, setSelectId] = useState(-1);
  const [dialogType, setDialogType] = useState<DialogType>("normal");
  const [tags, setTags] = useState<TagType[]>([]);
  const changeColor = ({ hex }) => {
    setColor(hex);
    if (selectId != -1) {
      const t = tags.find((tag) => tag.id === selectId);
      if (t) t.color = hex;
    }
  };
  const selectTag = ({ id, text, color }) => {
    setSelectId(id);
    setText(text);
    setColor(color);
    setDialogType("change");
  };
  const add = () => {
    setSelectId(-1);
    setDialogType("add");
    setColor(defaultTagColor);
    setText("");
  };
  const commitNewTag = () => {
    addTags([
      {
        text,
        color,
      },
    ])
      .then((tag: any) => {
        setTags((prev) => [...prev, ...tag]);
        setSelectId(tag[0].id);
        setDialogType("change");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const updateTags = () => {
    const data = [
      {
        id: selectId,
        text,
        color,
      },
    ];
    batchUpdateTags(data);
  };
  const del = () => {
    deleteTag([selectId]);
    setSelectId(-1);
    setText("");
    setDialogType("normal");
    setTags((prev) => prev.filter((tag) => tag.id !== selectId));
  };
  useEffect(() => {
    getTags().then(() => {
      setTags(deepClone(tagsStore.tags));
    });
  }, [getTags]);
  useEffect(() => {
    const { id, text, color, type } = defaultTag;
    setSelectId(id);
    setText(text);
    setColor(color);
    setDialogType(type);
  }, [defaultTag]);
  return (
    <Dialog open={show} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>标签管理</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 wrap-normal">
          {tags.map((tag) => (
            <Badge
              onClick={() => selectTag(tag)}
              className={`text-black min-w-[50px] h-[30px] cursor-pointer`}
              variant="outline"
              style={{
                backgroundColor: tag.color || defaultTagColor,
                borderColor: selectId === tag.id ? "red" : "",
              }}
              key={tag.id}
            >
              {tag?.text || ""}
            </Badge>
          ))}
          <Badge
            className={`text-black w-[50px] h-[30px] cursor-pointer text-xl`}
            variant="outline"
            onClick={add}
          >
            +
          </Badge>
        </div>
        {["add", "change"].includes(dialogType) && (
          <div className="flex gap-1.5">
            <ChromePicker onChange={changeColor} color={color} />

            <Card className="flex-1">
              <CardDescription className="mt-3 ml-5 text-gray-900">
                请输入标签名
              </CardDescription>
              <CardContent>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></Input>
              </CardContent>
              <CardFooter className="flex justify-end gap-1.5">
                {dialogType === "change" && <Button onClick={del}>删除</Button>}
                {dialogType === "add" && (
                  <Button variant="outline" onClick={commitNewTag}>
                    添加
                  </Button>
                )}
                {dialogType === "change" && (
                  <Button variant="outline" onClick={updateTags}>
                    修改
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
const Menu = observer(function Menu() {
  const [showDialog, setShowDialog] = useState(false);
  const [defaultTags, setDefaultTags] = useState<
    (TagType & { type: DialogType }) | Record<string, unknown>
  >({});
  const addTags = () => {
    setDefaultTags({
      type: "add",
      id: -1,
      text: "",
      color: defaultTagColor,
    });
    console.log("addTags");
    setShowDialog(true);
  };
  const changeTags = (tag: TagType) => {
    setDefaultTags({
      type: "change",
      id: tag.id,
      text: tag.text,
      color: tag.color,
    });
    setShowDialog(true);
  };
  return (
    <>
      <TagDialog
        show={showDialog}
        onChange={setShowDialog}
        defaultTag={defaultTags}
      />
      <div className="w-64 h-full bg-white border-r pt-5">
        <div className="mb-5 pl-5 pr-5">
          <h2 className="mb-2">筛选</h2>
          <div>
            <div className="sliderItemText">
              <Airplay size={16} strokeWidth={1} />
              全部
            </div>
            <div className="sliderItemText">
              <Check size={16} strokeWidth={1} />
              已完成
            </div>
            <div className="sliderItemText">
              <AlarmClockPlus size={16} strokeWidth={1} />
              未完成
            </div>
            <div className="sliderItemText">
              <Star size={16} strokeWidth={1} />
              重要
            </div>
          </div>
        </div>
        <div className="mb-5 pl-5 pr-5">
          <h2 className="mb-2">标签</h2>
          <div className="flex flex-wrap gap-2">
            {tagsStore.tags.map((tag) => (
              <Badge
                onClick={() => changeTags(tag)}
                className={`text-black border-gray-300 min-w-[50px] h-[30px] cursor-pointer`}
                style={{ backgroundColor: tag?.color || defaultTagColor }}
                key={tag.id}
              >
                {tag?.text || ""}
              </Badge>
            ))}
            <Badge
              className={`text-black border-gray-300 w-[50px] h-[30px] bg-white text-xl cursor-pointer`}
              onClick={addTags}
            >
              +
            </Badge>
          </div>
        </div>
        <div className="mb-5">
          <h2 className="mb-2 pl-5 pr-5 ">日历</h2>
          <Calendar />
        </div>
      </div>
    </>
  );
});
export default Menu;
