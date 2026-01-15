export const priorityList = [
  {
    val: 0,
    label: "P0",
    color: "#ff0000", // 红色，最高优先级
  },
  {
    val: 1,
    label: "P1",
    color: "#ff4500", // 橙红
  },
  {
    val: 2,
    label: "P2",
    color: "#ffa500", // 橙色
  },
  {
    val: 3,
    label: "P3",
    color: "#ffd700", // 金色
  },
  {
    val: 4,
    label: "P4",
    color: "#9acd32", // 黄绿色
  },
  {
    val: 5,
    label: "P5",
    color: "#00ff00", // 绿色，最低优先级
  },
];

export const defaultPriority = 3;
export const defaultTagColor = "#ffffff";
export const defaultStatus = "unknow";
export const statusList = {
  doing: {
    label: "进行中",
    color: "#ff4500",
  },
  done: {
    label: "已完成",
    color: "#00ff00",
  },
  late: {
    label: "已延期",
    color: "#ff0000",
  },
  unknow: {
    label: "未知",
    color: defaultTagColor,
  },
};
