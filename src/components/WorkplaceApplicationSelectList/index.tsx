import * as style from "../../style.module.css"

interface Props {
  children: JSX.Element
}
const Index = ({ children }: Props) => {
  return <ul className={style.header}>{children}</ul>
}

export default Index
