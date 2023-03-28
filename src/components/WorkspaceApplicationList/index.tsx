import React from "react"

import * as style from "../../style.module.css"

interface Props {
  children: React.ReactNode
}
const WorkspaceApplicationList = ({ children }: Props) => {
  return <ul className={style.applicationList}>{children}</ul>
}

export default WorkspaceApplicationList
