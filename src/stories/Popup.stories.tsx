import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";

import { router } from "../router";
import { LoggerProvider } from "../utils/logger/context";

import * as styles from "../style.module.css";

const IndexPopupMock = () => {
  return (
    <LoggerProvider>
      <div className={styles.popupContainer} style={{ border: "1px solid #ccc", margin: "1em" }}>
        <h1>Google Workspace Zoom</h1>
        <RouterProvider router={router} />
        <p className={styles.supportMeLinkContainer}>
          <small>
            💚{" "}
            <a target="_blank" href="https://buymeacoffee.com/vernacchia" rel="noreferrer">
              Support me
            </a>{" "}
            🤟
          </small>
        </p>
      </div>
    </LoggerProvider>
  );
};

const meta = {
  title: "Popup",
  component: IndexPopupMock,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof IndexPopupMock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
