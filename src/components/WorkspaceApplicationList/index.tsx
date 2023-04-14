import React from "react"

import * as style from "../../style.module.css"
import localise from "../../utils/localise"

interface Props {
  children: React.ReactNode
}
const WorkspaceApplicationList = ({ children }: Props) => {
  return (
    <>
      <h3 style={{ marginBottom: 0 }}>
        {localise("popupApplicationsSectionTitle")}
      </h3>
      <ul className={style.applicationList}>{children}</ul>
    </>
  )
}

export default WorkspaceApplicationList
