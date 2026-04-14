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
      <nav className={styles.navTabs}>
        <ul>
          <li>
            <Link
              to="/"
              className={styles.tabLink}
              activeOptions={{ exact: true }}
              activeProps={{ className: `${styles.tabLink} ${styles.tabLinkActive}` }}>
              {localize("popupNavHome")}
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={styles.tabLink}
              activeProps={{ className: `${styles.tabLink} ${styles.tabLinkActive}` }}>
              {localize("popupNavSettings")}
            </Link>
          </li>
        </ul>
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
