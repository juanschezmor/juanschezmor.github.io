import { useContext } from "react";
import type { Context } from "react";

export const useRequiredContext = <T>(
  context: Context<T | undefined>,
  hookName: string
) => {
  const value = useContext(context);

  if (!value) {
    throw new Error(`${hookName} must be used within its matching provider`);
  }

  return value;
};
