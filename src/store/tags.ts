import { compareArray } from "@/lib/utils";
import { makeAutoObservable } from "mobx";
import { request } from "@/lib/request";
import { TagType } from "./interface";
import { defaultTagColor } from "@/lib/common/data";
type commitTag = Omit<TagType, "id">;
class TagsStore {
  public tags: TagType[] = [];
  public idMap: Map<string, number> = new Map();
  constructor() {
    makeAutoObservable(this);
    this.getTags();
  }
  private formateTags = (tags: (string | commitTag)[]) => {
    return tags.map((tag) => {
      if (typeof tag == "string") {
        return { text: tag, color: defaultTagColor };
      } else {
        return tag;
      }
    });
  };
  public getNewTasgs = (tags: string[]) => {
    return compareArray(
      tags,
      this.tags.map((tag) => tag.text)
    );
  };
  public addTags = async (tags: (string | commitTag)[]) => {
    return new Promise(async (resolve, reject) => {
      const res = await request({
        url: "/api/tags",
        method: "put",
        data: this.formateTags(tags),
      });
      if (res.code == 200) {
        this.getTags();
        resolve(res.data);
      }
      reject(res.msg || "添加失败");
    });
  };
  public getTags = async () => {
    const res = await request({
      url: "/api/tags",
      method: "get",
    });
    if (res.code == 200) {
      this.tags = res.data as TagType[];
      this.updataMap();
    }
  };
  private updataMap() {
    this.tags.forEach((tag) => {
      this.idMap.set(tag.text, tag.id);
    });
  }

  public changeTagColor = (id: number, color: string) => {
    this.tags.find((tag) => tag.id == id)!.color = color;
  };
  public deleteTag = async (id: number[]) => {
    const res = await request({
      url: "/api/tags",
      method: "delete",
      data: { id },
    });
    if (res.code == 200) {
      this.getTags();
      return true;
    }
    return false;
  };
  //批量update
  public batchUpdateTags = async (data: TagType[]) => {
    const res = await request({
      url: "/api/tags",
      method: "POST",
      data,
    });
    if (res.code == 200) {
      this.getTags();
      this.updataMap();
      return true;
    }
    return false;
  };
}
export const tagsStore = new TagsStore();
