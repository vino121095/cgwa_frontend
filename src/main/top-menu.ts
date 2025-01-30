import { type Menu } from "@/stores/menuSlice";

const menu: Array<Menu | "divider"> = [
  {
    icon: "Home",
    title: "Dashboard",
    pathname: '/dashboard', // Fix typo in pathname,
    roles : ['admin', 'aggregator', 'industry']
  },
  {
    icon: "Users",
    title: "Sites",
    pathname: '/sites',
    roles : ['admin', 'aggregator', 'industry', 'visitor']
  },
  {
    icon: "User",
    title: "Aggregator",
    pathname: '/aggregator',
    roles : ['admin','aggregator']
  },
  {
    icon: "Factory",
    title: "Industry",
    pathname: '/industry',
    roles : ['admin', 'industry']
  },
  {
    icon: "NotepadText",
    title: "Parahead Management",
    pathname: '/reports',
    roles : ['admin']
  },
  {
    icon: "Key",
    title: "Auth Keys",
    pathname: '/reports',
    roles : ['admin']
  },
  {
    icon: "Home",
    title: "Dashboard",
    pathname: '/site/dashboard', // Fix typo in pathname
    roles : ['visitor', 'siter']
  },
  {
    icon: "Activity",
    title: "Trend Charts",
    pathname: '/dashboard', // Fix typo in pathname
    roles : ['visitor', 'siter']
  },
  {
    icon: "Activity",
    title: "Devices Charts",
    pathname: '/dashboard', // Fix typo in pathname
    roles : ['visitor', 'siter']
  },
  {
    icon: "NotepadText",
    title: "Reports",
    pathname: '/reports',
    roles : ['visitor', 'siter']
  },
];


export default menu;
