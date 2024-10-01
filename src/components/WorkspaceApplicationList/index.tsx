import Tippy from "@tippyjs/react";
import React, { type MouseEventHandler } from "react";
import SettingsIcon from "react:~/assets/popup_icons/settings.svg";
import * as style from "src/style.module.css";
import localize from "src/utils/localize";

interface Props {
  children: React.ReactNode;
  onSettingsClick: MouseEventHandler<HTMLButtonElement>;
}

const iconHeight = 15;

const WorkspaceApplicationList = ({ children, onSettingsClick }: Props) => {
  return (
    <>
      <h3 style={{ marginBottom: 0, display: "flex", alignItems: "center" }}>
        {localize("popupApplicationsSectionTitle")}
        <Tippy placement="right" content={localize("popupSettingsTitle")}>
          <button
            onClick={onSettingsClick}
            style={{
              all: "unset",
              cursor: "pointer",
              marginLeft: 3,
              height: iconHeight
            }}>
            <SettingsIcon width={iconHeight} height={iconHeight} />
          </button>
        </Tippy>
      </h3>
      <ul className={style.applicationList}>{children}</ul>
    </>
  );
};

export default WorkspaceApplicationList;
