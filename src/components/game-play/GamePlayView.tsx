/**
 * GamePlayView - main view for game play (E3)
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useStores } from "../../hooks/useStores";
import { PlayerScoreDisplay } from "./PlayerScoreDisplay";
import { CurrentVisitDisplay } from "./CurrentVisitDisplay";
import { CheckoutDisplay } from "./CheckoutDisplay";
import { ButtonInput } from "../input/ButtonInput";
import { WinnerDialog } from "../dialogs/WinnerDialog";

export const GamePlayView = observer(function GamePlayView(): JSX.Element {
  const { gameStore, uiStore } = useStores();
  const game = gameStore.currentGame;

  if (!game) {
    return (
      <Container maxWidth="sm" sx={{ py: 3, textAlign: "center" }}>
        No game in progress.
      </Container>
    );
  }

  const handleThrow = (segment: number, multiplier: 1 | 2 | 3): void => {
    game.recordThrow({ segment, multiplier });

    // Check for winner
    if (game.isFinished()) {
      uiStore.openWinnerDialog();
    }
  };

  const handleUndo = (): void => {
    game.undoLastThrow();
  };

  const handleWinnerDialogClose = (): void => {
    uiStore.closeWinnerDialog();
    gameStore.endGame();
    uiStore.goToPlayerSetup();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        height: "100dvh", // Dynamic viewport height for mobile
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Player scores with overlaid menu */}
      <Box sx={{ flexShrink: 0, position: "relative" }}>
        <IconButton size="small" sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}>
          <MenuIcon fontSize="small" />
        </IconButton>
        <PlayerScoreDisplay game={game} />
      </Box>

      {/* Current visit + Checkout in a row */}
      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 1, px: 1, pb: 1 }}>
        <CurrentVisitDisplay visit={game.state.currentVisit} />
        <CheckoutDisplay suggestion={game.getCheckoutSuggestion()} />
      </Box>

      {/* Input area - takes remaining space */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 1, minHeight: 0 }}>
        <ButtonInput onThrow={handleThrow} onUndo={handleUndo} />
      </Box>

      {/* Winner dialog */}
      <WinnerDialog
        open={uiStore.showWinnerDialog}
        winner={game.getWinner()}
        onClose={handleWinnerDialogClose}
      />
    </Box>
  );
});
