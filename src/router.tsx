import { MemoryRouter, NavLink, Route, Routes } from "react-router-dom";

import HomeView from "./areas/home";
import SettingsView from "./areas/settings";
import localize from "./utils/localize";

import * as styles from "./style.module.css";

export function AppRouter() {
  return (
    <MemoryRouter>
      <nav className={styles.navTabs}>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.tabLink} ${styles.tabLinkActive}` : styles.tabLink
              }
              end>
              {localize("popupNavHome")}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? `${styles.tabLink} ${styles.tabLinkActive}` : styles.tabLink
              }>
              {localize("popupNavSettings")}
            </NavLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </MemoryRouter>
  );
}
