import React from "react";
import localize from "src/utils/localize";

import * as style from "src/style.module.css";

interface Props {
  children: React.ReactNode;
}

const WorkspaceApplicationList = ({ children }: Props) => {
  return (
    <>
      <h3 style={{ marginBottom: 0, display: "flex", alignItems: "center" }}>
        {localize("popupApplicationsSectionTitle")}
      </h3>
      <ul className={style.applicationList}>{children}</ul>
    </>
  );
};

export default WorkspaceApplicationList;
