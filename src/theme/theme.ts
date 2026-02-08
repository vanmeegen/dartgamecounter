/**
 * MUI Theme configuration
 * Light and dark themes that follow the system color scheme preference
 */

import { createTheme, type Theme } from "@mui/material/styles";

const sharedTypography = {
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
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none" as const,
        borderRadius: 8,
      },
      contained: {
        "&:active": {
          filter: "brightness(1.4)",
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
};

export const darkTheme: Theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00e676",
    },
    secondary: {
      main: "#00bcd4",
    },
    error: {
      main: "#ff1744",
    },
    background: {
      default: "#0a0e14",
      paper: "#141a22",
    },
  },
  typography: sharedTypography,
  components: {
    ...sharedComponents,
    MuiButton: {
      styleOverrides: {
        ...sharedComponents.MuiButton.styleOverrides,
        outlined: {
          "&:active": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            borderColor: "rgba(255, 255, 255, 0.5)",
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
  },
});

export const lightTheme: Theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00c853",
    },
    secondary: {
      main: "#0097a7",
    },
    error: {
      main: "#d50000",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
  },
  typography: sharedTypography,
  components: {
    ...sharedComponents,
    MuiButton: {
      styleOverrides: {
        ...sharedComponents.MuiButton.styleOverrides,
        outlined: {
          "&:active": {
            backgroundColor: "rgba(0, 0, 0, 0.12)",
            borderColor: "rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:active": {
            backgroundColor: "rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
  },
});

/** @deprecated Use darkTheme or lightTheme instead */
export const theme = darkTheme;
