import { execFileSync } from "node:child_process";
import path from "node:path";

import { defineConfig } from "wxt";

import packageJson from "./package.json";

// The build mode is the edition: `--mode base|extended`. Any other mode builds Base, like src/utils/edition.ts.
const EDITIONS = {
  base: {
    name: "__MSG_extensionName__",
    geckoId: "google-workspace-zoom-default@vernacchia.dev",
    permissions: ["storage"]
  },
  extended: {
    name: "__MSG_extensionNameExtended__",
    geckoId: "google-workspace-zoom-extended@vernacchia.dev",
    // Custom zoom no longer uses `chrome.debugger` (#110), but released versions request it. Dropping it and adding
    // it back later would disable the extension for every user until they accept it again, so it stays for now.
    permissions: ["storage", "debugger"]
  }
} as const;

// Any mode other than "extended" builds Base, the same rule as src/utils/edition.ts
const EDITION_BY_MODE: Record<string, keyof typeof EDITIONS> = { extended: "extended" };

const ICON_SIZES = [16, 32, 48, 64, 128] as const;
const icons = Object.fromEntries(ICON_SIZES.map((size) => [size, `/icon/${size}.png`]));

// A missing git binary or a checkout without .git must not break the dev server
const readGit = (args: string[]): string | undefined => {
  try {
    const output = execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return output || undefined;
  } catch {
    return undefined;
  }
};

export default defineConfig({
  srcDir: "src",
  publicDir: "public",
  // The default outDirTemplate then gives build/<browser>-mv<n>-<mode>, so the editions keep the paths CI uses
  outDir: "build",
  imports: false,
  modules: ["@wxt-dev/module-react"],
  alias: { src: "src" },
  // Load build/<browser>-mv<n>-<edition> by hand, as with Plasmo
  webExt: { disabled: true },
  // The existing listing has no data collection declaration; the manifest must not change
  suppressWarnings: { firefoxDataCollection: true },
  zip: {
    // {{manifestVersion}} already includes the "mv" prefix
    artifactTemplate: "{{browser}}-{{manifestVersion}}{{modeSuffix}}.zip",
    exclude: ["**/*.map"],
    zipSources: false
  },
  vite: ({ command }) => {
    if (command === "build") {
      // WXT sets Vite's mode to the edition, so Vite would treat the build as non-production and
      // @vitejs/plugin-react would compile JSX for development. Vite decides production from NODE_ENV.
      process.env.NODE_ENV = "production";
    }

    if (command === "build") {
      return {
        define: { "process.env.NODE_ENV": JSON.stringify("production") },
        build: { sourcemap: true }
      };
    }

    // Dev only: production builds never run git or embed the branch and commit
    return {
      define: {
        "import.meta.env.GIT_BRANCH": JSON.stringify(
          readGit(["rev-parse", "--abbrev-ref", "HEAD"]) ?? ""
        ),
        "import.meta.env.GIT_COMMIT": JSON.stringify(
          readGit(["rev-parse", "--short", "HEAD"]) ?? ""
        )
      }
    };
  },
  manifest: ({ browser, mode }) => {
    const editionName = EDITION_BY_MODE[mode] ?? "base";
    if (browser === "firefox" && editionName === "extended") {
      throw new Error("Firefox ships only the Base edition; build it with --mode base.");
    }
    const edition = EDITIONS[editionName];
    return {
      name: edition.name,
      default_locale: "en",
      // Plasmo copied package.json's author; the manifest types only allow Chrome's deprecated `{ email }` form
      author: packageJson.author as unknown as { email: string },
      permissions: [...edition.permissions],
      icons,
      action: { default_icon: icons },
      ...(browser === "firefox" && {
        browser_specific_settings: { gecko: { id: edition.geckoId } }
      })
    };
  },
  hooks: {
    "build:publicAssets": (wxt, files) => {
      const edition = EDITION_BY_MODE[wxt.config.mode] ?? "base";
      for (const size of ICON_SIZES) {
        files.push({
          absoluteSrc: path.resolve(wxt.config.root, `assets/icons/${edition}/${size}.png`),
          relativeDest: `icon/${size}.png`
        });
      }
    }
  }
});
