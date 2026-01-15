import { makeAutoObservable } from "mobx";
class UiStore {
  isDrawerOpen = false;
  constructor() {
    makeAutoObservable(this);
  }
  setIsDrawerOpen = (isDrawerOpen: boolean) => {
    this.isDrawerOpen = isDrawerOpen;
  };
}

export const uiStore = new UiStore();
