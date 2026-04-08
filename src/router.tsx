import {
  Link,
  Outlet,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter
} from "@tanstack/react-router";

import HomeView from "./areas/home";
import SettingsView from "./areas/settings";
import localize from "./utils/localize";

import * as styles from "./style.module.css";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav className={styles.tabContainer}>
        <Link
          to="/"
          className={styles.tabItem}
          activeProps={{ className: `${styles.tabItem} ${styles.tabItemActive}` }}>
          {localize("popupNavHome")}
        </Link>
        <Link
          to="/settings"
          className={styles.tabItem}
          activeProps={{ className: `${styles.tabItem} ${styles.tabItemActive}` }}>
          {localize("popupNavSettings")}
        </Link>
      </nav>
      <Outlet />
    </>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeView
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsView
});

const routeTree = rootRoute.addChildren([indexRoute, settingsRoute]);

const memoryHistory = createMemoryHistory({
  initialEntries: ["/"]
});

export const router = createRouter({
  routeTree,
  history: memoryHistory
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
