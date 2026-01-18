/**
 * GamePlayView - main view for game play (E3)
 */

import { useState, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import { useStores } from "../../hooks/useStores";
import { PlayerScoreDisplay } from "./PlayerScoreDisplay";
import { CurrentVisitDisplay } from "./CurrentVisitDisplay";
import { CheckoutDisplay } from "./CheckoutDisplay";
import { ButtonInput } from "../input/ButtonInput";
import { WinnerDialog } from "../dialogs/WinnerDialog";
import type { Player } from "../../types";

export const GamePlayView = observer(function GamePlayView(): JSX.Element {
  const { gameStore, uiStore } = useStores();
  const game = gameStore.currentGame;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  if (!game) {
    return (
      <Container maxWidth="sm" sx={{ py: 3, textAlign: "center" }}>
        No game in progress.
      </Container>
    );
  }

  const handleThrow = (segment: number, multiplier: 1 | 2 | 3): void => {
    game.recordThrow({ segment, multiplier });

    // Check for leg or match finish
    if (game.isLegFinished()) {
      uiStore.openWinnerDialog();
    }
  };

  const handleUndo = (): void => {
    game.undoLastThrow();
  };

  const handleNextLeg = (): void => {
    uiStore.closeWinnerDialog();
    gameStore.nextLeg();
  };

  const handleNewGame = (): void => {
    uiStore.closeWinnerDialog();
    gameStore.endGame();
    uiStore.goToPlayerSetup();
  };

  // Find the leg winner (player whose score is 0)
  const getLegWinner = (): Player | null => {
    const winningPlayer = game.state.players.find((ps) => ps.score === 0);
    if (winningPlayer) {
      return game.players.find((p) => p.id === winningPlayer.playerId) ?? null;
    }
    return null;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setMenuAnchor(null);
  };

  const handleLeaveGame = (): void => {
    handleMenuClose();
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
      {/* Player scores with overlaid menu/install */}
      <Box sx={{ flexShrink: 0, position: "relative" }}>
        <Box sx={{ position: "absolute", top: 4, right: 4, zIndex: 1, display: "flex", gap: 0.5 }}>
          {uiStore.canInstall && (
            <IconButton
              size="small"
              onClick={() => uiStore.promptInstall()}
              sx={{ color: "primary.main" }}
            >
              <InstallMobileIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={handleMenuOpen}>
            <MenuIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleLeaveGame}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Leave Game</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
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
        winner={game.isFinished() ? game.getWinner() : getLegWinner()}
        isMatchWinner={game.isFinished()}
        currentLeg={game.state.currentLeg}
        onNextLeg={handleNextLeg}
        onNewGame={handleNewGame}
      />
    </Box>
  );
});
