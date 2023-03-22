import type { ChangeEvent } from "react"

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
    <li>
      {application}{" "}
      <select onChange={onDefaultZoomChange} value={selectedValue}>
        {values.map((value) => {
          return <option>{value}</option>
        })}
      </select>
    </li>
  )
}

export default Index
