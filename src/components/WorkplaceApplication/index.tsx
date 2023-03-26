import { useId } from "react"
import type { ChangeEvent } from "react"

import * as style from "../../style.module.css"

interface Props {
  application: "Docs"
  values: string[]
  selectedValue: string
  onDefaultZoomChange: (event: ChangeEvent<HTMLSelectElement>) => void
}
const Index = ({
  application,
  values,
  selectedValue,
  onDefaultZoomChange
}: Props) => {
  return (
    <li className={style.applicationListItem}>
      <span className={style.applicationTitle}>{application} </span>
      <select onChange={onDefaultZoomChange} value={selectedValue}>
        {values.map((value) => {
          return <option key={useId()}>{value}</option>
        })}
      </select>
    </li>
  )
}

export default Index
