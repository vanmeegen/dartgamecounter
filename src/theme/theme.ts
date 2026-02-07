/**
 * MUI Theme configuration
 * Dark theme optimized for dart game counter
 */

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4caf50", // Green for positive actions
    },
    secondary: {
      main: "#ff9800", // Orange for highlights
    },
    error: {
      main: "#f44336", // Red for bust/errors
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
        outlined: {
          "&:active": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            borderColor: "rgba(255, 255, 255, 0.5)",
          },
        },
        contained: {
          "&:active": {
            filter: "brightness(1.4)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:active": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
