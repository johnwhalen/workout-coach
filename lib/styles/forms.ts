/**
 * Shared form styles for dark-themed Mantine components
 */

import type { CSSProperties } from "react";

/**
 * Dark theme styles for Mantine text inputs, selects, and similar form controls
 */
export const darkInputStyles: {
  input: CSSProperties;
  label: CSSProperties;
} = {
  input: {
    backgroundColor: "#1e293b",
    borderColor: "#475569",
    color: "white",
  },
  label: {
    color: "white",
  },
};

/**
 * Glassmorphism effect for cards and modals
 */
export const glassmorphismStyles = {
  background: "rgba(17, 24, 39, 0.9)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
  borderRadius: "1rem",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(10px)",
} as const;
