import { type Menu } from "@/stores/menuSlice";
import Cookies from 'js-cookie';

const siteEnable = Cookies.get('viewsite');
// Declare menu array before if-else block
let menu: Array<Menu | "divider">;

if (siteEnable) {
  menu = [
    {
        icon: "Users",
        title: "Users",
        pathname: '/users',
    },
    {
      icon: "Home",
      title: "Dashboard",
      pathname: '/site/dashboard', // Fix typo in pathname
    },
    {
      icon: "Home",
      title: "Trend Charts",
      pathname: '/dashboard', // Fix typo in pathname
    },
    {
      icon: "Home",
      title: "Devices Charts",
      pathname: '/dashboard', // Fix typo in pathname
    },
    {
      icon: "NotepadText",
      title: "Reports",
      pathname: '/reports',
    },
  ];
} else {
  menu = [
    {
      icon: "Home",
      title: "Dashboard",
      pathname: '/dashboard', // Fix typo in pathname
    },
    {
      icon: "Users",
      title: "Sites",
      pathname: '/sites',
    },
    {
      icon: "User",
      title: "Aggreator",
      pathname: '/aggreator',
    },
    {
      icon: "Factory",
      title: "Industry",
      pathname: '/industry',
    },
    {
      icon: "NotepadText",
      title: "Reports",
      pathname: '/reports',
    },
  ];
}

export default menu;
