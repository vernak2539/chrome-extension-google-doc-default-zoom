import ReactMarkdown from "react-markdown"

import * as styles from "../style.module.css"

const Info = () => {
  const markdown = `## test

other

`
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}
      className={styles.popupContainer}>
      <ReactMarkdown children={markdown} />
      <h2>Delta Flyer Tab</h2>

      <p>This tab is only available on the Delta Flyer page.</p>
    </div>
  )
}

export default Info
