import { useEffect, type JSX } from "react";
import { observer } from "mobx-react-lite";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { theme } from "./theme";
import { StoreProvider, useUIStore } from "./hooks/useStores";
import { PlayerSetupView } from "./components/player-setup/PlayerSetupView";
import { GameConfigView } from "./components/game-config/GameConfigView";
import { GamePlayView } from "./components/game-play/GamePlayView";

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
