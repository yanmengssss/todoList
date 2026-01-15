"use client";
import { observer } from "mobx-react-lite";
import { uiStore } from "@/store/ui";
import { Drawer } from "@/app/components/drawer";

export const DrawerWrapper = observer(() => {
  return uiStore.isDrawerOpen ? <Drawer /> : null;
});
