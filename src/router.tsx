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

const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "secondary" }}>
              {localize("popupNavHome")}
            </Link>
          </li>
          <li>
            <Link to="/settings" activeProps={{ className: "secondary" }}>
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
