import React from "react"

import * as style from "../../style.module.css"

interface Props {
  children: React.ReactNode
}
const WorkspaceApplicationList = ({ children }: Props) => {
  throw new Error("test")

  return (
    <>
      <h3 style={{ marginBottom: 0 }}>
        {chrome.i18n.getMessage("popupApplicationsSectionTitle")}
      </h3>
      <ul className={style.applicationList}>{children}</ul>
    </>
  )
}

export default WorkspaceApplicationList
