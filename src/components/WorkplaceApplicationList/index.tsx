import * as style from "../../style.module.css"

interface Props {
  children: JSX.Element
}
const Index = ({ children }: Props) => {
  return <ul className={style.applicationList}>{children}</ul>
}

export default Index
