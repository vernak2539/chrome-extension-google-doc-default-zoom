import * as styles from "../../style.module.css";

type Props = {
  heading: string;
};

export const ErrorFallback = ({ heading }: Props) => (
  <div className={styles.popupContainer} style={{ minHeight: "unset" }}>
    <h1>{heading}</h1>
    <p>
      Sorry! Something has gone wrong. Please submit an issue{" "}
      <a href="https://github.com/vernak2539/chrome-extension-google-doc-default-zoom/issues/new/choose">
        here
      </a>{" "}
      so I can fix it!
    </p>
  </div>
);
