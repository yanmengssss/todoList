export interface CreateTaskType {
  title: string;
  description: string;
  priority: number;
  endAt: Date;
  favorite: boolean;
  tags: Array<number>;
  createdAt: Date;
}

export interface TaskType extends CreateTaskType {
  id: string;
  status: string;
  userId: string;
  tags: Array<number>;
}

export interface TagType {
  id: number;
  text: string;
  color: string;
}
