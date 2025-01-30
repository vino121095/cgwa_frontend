import { NavigateFunction } from "react-router-dom";
import { Menu } from "@/stores/menuSlice";
import { createContext } from "react";

interface Location {
  pathname: string;
  forceActiveMenu?: string;
}

export interface FormattedMenu extends Menu {
  active?: boolean;
  activeDropdown?: boolean;
  subMenu?: FormattedMenu[]; // Ensure this matches the structure of Menu
}

const forceActiveMenu = (location: Location, pathname: string) => {
  location.forceActiveMenu = pathname;
};

const forceActiveMenuContext = createContext<{
  forceActiveMenu: (pathname: string) => void;
}>({
  forceActiveMenu: () => {},
});

// Role-based menu filtering
const filterMenuByRole = (
  menu: Array<Menu | "divider">,
  userRoles: string[]
): Array<Menu | "divider"> => {
  return menu
    .filter(
      (item) =>
        typeof item === "string" || // Allow dividers to pass through
        (item.roles &&
          item.roles.some((role) => userRoles.includes(role))) // Check if roles match
    )
    .map((item) => {
      if (typeof item !== "string" && item.subMenu) {
        return {
          ...item,
          subMenu: filterMenuByRole(item.subMenu, userRoles), // Recursively filter submenus
        };
      }
      return item;
    }) as Array<Menu | "divider">; // Assert the type explicitly
};

// Find active menu
const findActiveMenu = (subMenu: Menu[], location: Location): boolean => {
  let match = false;
  subMenu.forEach((item) => {
    if (
      ((location.forceActiveMenu !== undefined &&
        item.pathname === location.forceActiveMenu) ||
        (location.forceActiveMenu === undefined &&
          item.pathname === location.pathname)) &&
      !item.ignore
    ) {
      match = true;
    } else if (!match && item.subMenu) {
      match = findActiveMenu(item.subMenu, location);
    }
  });
  return match;
};

const nestedMenu = (
  menu: Array<Menu | "divider">,
  location: Location,
  userRoles: string[]
): Array<FormattedMenu | "divider"> => {
  const roleFilteredMenu = filterMenuByRole(menu, userRoles);
  const formattedMenu: Array<FormattedMenu | "divider"> = [];
  roleFilteredMenu.forEach((item) => {
    if (typeof item !== "string") {
      const menuItem: FormattedMenu = {
        ...item,
        active: false,
        activeDropdown: false,
      };
      menuItem.active =
        ((location.forceActiveMenu !== undefined &&
          menuItem.pathname === location.forceActiveMenu) ||
          (location.forceActiveMenu === undefined &&
            menuItem.pathname === location.pathname) ||
          (menuItem.subMenu && findActiveMenu(menuItem.subMenu, location))) &&
        !menuItem.ignore;

      if (menuItem.subMenu) {
        menuItem.activeDropdown = findActiveMenu(menuItem.subMenu, location);

        // Nested menu
        const subMenu: Array<FormattedMenu> = [];
        nestedMenu(menuItem.subMenu, location, userRoles).forEach(
          (nestedItem) =>
            typeof nestedItem !== "string" && subMenu.push(nestedItem)
        );
        menuItem.subMenu = subMenu;
      }

      formattedMenu.push(menuItem);
    } else {
      formattedMenu.push(item);
    }
  });

  return formattedMenu;
};

const linkTo = (menu: FormattedMenu, navigate: NavigateFunction) => {
  if (menu.subMenu) {
    menu.activeDropdown = !menu.activeDropdown;
  } else {
    if (menu.pathname !== undefined) {
      navigate(menu.pathname);
    }
  }
};

export { nestedMenu, linkTo, forceActiveMenuContext, forceActiveMenu };
