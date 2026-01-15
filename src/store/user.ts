// stores/counterStore.ts
import { makeAutoObservable } from "mobx";
type UserInfo =
  | "userId"
  | "userName"
  | "userAvatar"
  | "userEmail"
  | "userPhone"
  | "userAddress"
  | "userBirthday";
class UserStore {
  userId = "";
  userName = "";
  userAvatar = "";
  userEmail = "";
  userPhone = "";
  userAddress = "";
  userBirthday = "";

  constructor() {
    makeAutoObservable(this);
  }

  setUserInfo(key: UserInfo, value: string) {
    this[key] = value;
  }
}

export const userStore = new UserStore();
