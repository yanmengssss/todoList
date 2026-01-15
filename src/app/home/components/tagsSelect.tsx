import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { compareArray } from "@/lib/utils";
import { tagsStore } from "@/store";
export function TagsSelect({ onChange, value }: { onChange: (value: string) => void; value?: string }) {
  const [open, setOpen] = useState<boolean>(false); //是否打开选择
  const [inputValue, setInputValue] = useState<string>(value || ""); //输入值
  const [selectList, setSelectList] = useState<string[]>(value ? value.split("/").filter(Boolean) : [""]); //选中值
  const [list, setList] = useState<string[]>([]); //当前tag标签
  useEffect(() => {
    onChange(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);
  useEffect(() => {
    setList(tagsStore.tags.map((item) => item.text));
  }, []);
  // 当外部 value 变化时，更新内部状态
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
      setSelectList(value ? value.split("/").filter(Boolean) : [""]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const enterInputTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!inputValue) {
        setSelectList([]);
        return;
      }
      const tagList = inputValue.split("/");
      const newTags = compareArray(tagList, list);
      if (newTags.length > 0) {
        setList((prev) => [...prev, ...newTags]);
        tagsStore.addTags(tagsStore.getNewTasgs(newTags));
      }
      setSelectList(tagList);
    }
  };
  const selectTag = (e: React.MouseEvent<HTMLDivElement>, tag: string) => {
    e.preventDefault(); // 防止失焦
    if (selectList.includes(tag)) {
      setSelectList((prev) => prev.filter((item) => item !== tag));
      //value去除tag
      setInputValue((prev) => {
        const tagList = prev.split("/");
        const newTagList = tagList.filter((item) => item !== tag);
        return newTagList.join("/");
      });
    } else {
      setSelectList((prev) => [...prev, tag]);
      setInputValue((prev) => (prev ? prev + "/" + tag : tag));
    }
  };
  return (
    <div className="relative w-full">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // ✅ 输入
        onFocus={() => setOpen(true)} // 聚焦打开
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => enterInputTag(e)}
        placeholder="请选择标签，自定义标签请用 / 隔开"
      />
      {open && (
        <div className="absolute mt-1 w-full border rounded bg-white shadow z-10 min-h-[80px] overflow-y-auto max-h-[300px]">
          {list.length > 0 ? (
            list.map((tag) => (
              <div
                key={tag}
                className={
                  "px-2 py-1 hover:bg-blue-50 cursor-pointer text-[0.9rem] " +
                  (selectList.includes(tag) ? "bg-blue-50" : "")
                }
                onMouseDown={(e) => selectTag(e, tag)}
              >
                {tag}
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm text-center py-2 mt-[20px]">
              暂无标签
            </div>
          )}
        </div>
      )}
    </div>
  );
}
