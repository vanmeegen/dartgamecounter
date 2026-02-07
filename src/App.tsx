import { useEffect, useMemo, type JSX } from "react";
import { observer } from "mobx-react-lite";
import { ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { darkTheme, lightTheme } from "./theme";
import { StoreProvider, useUIStore } from "./hooks/useStores";
import { PlayerSetupView } from "./components/player-setup/PlayerSetupView";
import { GameConfigView } from "./components/game-config/GameConfigView";
import { GamePlayView } from "./components/game-play/GamePlayView";

// Register all game modules
import "./games/x01";

const AppContent = observer(function AppContent(): JSX.Element {
  const uiStore = useUIStore();

  useEffect(() => {
    uiStore.setupInstallPrompt();
  }, [uiStore]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {uiStore.currentView === "player-setup" && <PlayerSetupView />}
      {uiStore.currentView === "game-config" && <GameConfigView />}
      {uiStore.currentView === "game-play" && <GamePlayView />}
    </Box>
  );
});

export function App(): JSX.Element {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => (prefersDarkMode ? darkTheme : lightTheme), [prefersDarkMode]);

  // Update the theme-color meta tag to match the current mode
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", prefersDarkMode ? "#121212" : "#f5f5f5");
    }
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
