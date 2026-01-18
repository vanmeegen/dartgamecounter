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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header with menu */}
      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
        <IconButton size="small">
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Player scores */}
      <PlayerScoreDisplay game={game} />

      {/* Current visit */}
      <CurrentVisitDisplay visit={game.state.currentVisit} />

      {/* Input area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 1 }}>
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
