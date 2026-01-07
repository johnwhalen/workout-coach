/**
 * Shared form styles for dark-themed Mantine components
 * Swiss minimalist design: navy-700 backgrounds, gold accents
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
    backgroundColor: "#1e3a5f", // navy-700
    borderColor: "#1e3a5f", // No visible border
    color: "white",
  },
  label: {
    color: "#94a3b8", // slate-400
    fontWeight: 500,
  },
};

/**
 * Glassmorphism effect for cards and modals
 */
export const glassmorphismStyles = {
  background: "rgba(17, 24, 39, 0.8)",
  borderRadius: "0.75rem",
  border: "1px solid rgba(51, 65, 85, 0.3)",
  backdropFilter: "blur(10px)",
} as const;
