import type { SerializedError } from "src/types";

export const serializeError = (error: unknown): SerializedError => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  return { name: "Error", message: String(error) };
};

export const deserializeError = ({ name, message, stack }: SerializedError): Error => {
  const error = new Error(message);
  error.name = name;
  // Without a stack of its own the error would get the stack of this function, and Sentry would show
  // background frames for a failure that happened in the content script.
  error.stack = stack ?? `${name}: ${message}`;
  return error;
};
