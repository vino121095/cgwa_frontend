import { type Menu } from "@/stores/menuSlice";

const menu: Array<Menu | "divider"> = [
  {
    icon: "Home",
    title: "Dashboard",
    pathname :'/dashbaord'
  },
  {
    icon: "Users",
    title: "Users",
    pathname :'/users',
  },
  {
    icon: "NotepadText",
    title: "Reports",
    pathname :'/reports'
  }
];

export default menu;
