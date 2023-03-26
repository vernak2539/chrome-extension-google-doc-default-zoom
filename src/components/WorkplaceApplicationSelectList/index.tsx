interface Props {
  children: JSX.Element
}
const Index = ({ children }: Props) => {
  return (
    <ul
      style={{
        margin: 0
      }}>
      {children}
    </ul>
  )
}

export default Index
