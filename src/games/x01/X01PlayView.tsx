/**
 * X01PlayView - complete gameplay view for X01 games
 * Self-contained: handles scoring, input, checkout, winner dialog, statistics.
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
import AppsIcon from "@mui/icons-material/Apps";
import AdjustIcon from "@mui/icons-material/Adjust";
import { useStores } from "../../hooks/useStores";
import { ButtonInput } from "../../shared/components/input";
import { DartboardInput } from "../../shared/components/dartboard";
import { CurrentVisitDisplay } from "../../shared/components/CurrentVisitDisplay";
import { WinnerDialog } from "../../shared/components/dialogs";
import { X01ScoreDisplay } from "./X01ScoreDisplay";
import { X01CheckoutDisplay } from "./X01CheckoutDisplay";
import { X01Statistics } from "./X01Statistics";
import { calculateX01PlayerStats } from "./statistics";
import type { GamePlayComponentProps } from "../types";
import type { X01Game } from "./X01Game";
import type { X01PlayerStats, X01AllTimePlayerStats } from "./types";
import type { Player } from "../../types";

export const X01PlayView = observer(function X01PlayView({
  game: baseGame,
  onThrow,
  onUndo,
  onLegFinished,
  onLeaveGame,
  onNewGame,
}: GamePlayComponentProps): JSX.Element {
  const { uiStore, statisticsStore } = useStores();
  const game = baseGame as X01Game;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  if (!game) {
    return (
      <Container maxWidth="sm" sx={{ py: 3, textAlign: "center" }}>
        No game in progress.
      </Container>
    );
  }

  const handleThrow = (segment: number, multiplier: 1 | 2 | 3): void => {
    onThrow(segment, multiplier);

    // Check for leg or match finish after the throw is recorded
    if (game.isLegFinished()) {
      onLegFinished();
    }
  };

  const handleNextLeg = (): void => {
    uiStore.closeWinnerDialog();
    game.nextLeg();
  };

  const saveGameStats = (): void => {
    const completedLegs = game.getAllCompletedLegs();
    if (completedLegs.length === 0) return;

    const playerIdToName = new Map(game.players.map((p) => [p.id, p.name]));
    const playerNames = game.players.map((p) => p.name);
    const matchWinner = game.getWinner();

    statisticsStore.recordGameStats(
      "x01",
      playerNames,
      completedLegs,
      playerIdToName,
      game.config.variant,
      matchWinner?.name ?? null
    );
  };

  const handleNewGame = (): void => {
    saveGameStats();
    uiStore.closeWinnerDialog();
    onNewGame();
  };

  const handleLeaveGame = (): void => {
    handleMenuClose();
    saveGameStats();
    onLeaveGame();
  };

  // Find the leg winner (player whose score is 0)
  const getLegWinner = (): Player | null => {
    const winningPlayer = game.state.players.find((ps) => ps.score === 0);
    if (winningPlayer) {
      return game.players.find((p) => p.id === winningPlayer.playerId) ?? null;
    }
    return null;
  };

  // Compute current game statistics for all players
  const computeCurrentGameStats = (): Map<string, X01PlayerStats> => {
    const completedLegs = game.getAllCompletedLegs();
    const statsMap = new Map<string, X01PlayerStats>();
    for (const player of game.players) {
      statsMap.set(
        player.name,
        calculateX01PlayerStats(player.id, completedLegs, game.config.variant)
      );
    }
    return statsMap;
  };

  // Get all-time stats for all players
  const getAllTimeStats = (): Map<string, X01AllTimePlayerStats | null> => {
    const statsMap = new Map<string, X01AllTimePlayerStats | null>();
    for (const player of game.players) {
      statsMap.set(
        player.name,
        statisticsStore.getPlayerStats("x01", player.name) as X01AllTimePlayerStats | null
      );
    }
    return statsMap;
  };

  const playerNames = game.players.map((p) => p.name);
  const currentGameStats = uiStore.showWinnerDialog
    ? computeCurrentGameStats()
    : new Map<string, X01PlayerStats>();
  const allTimeStats = uiStore.showWinnerDialog
    ? getAllTimeStats()
    : new Map<string, X01AllTimePlayerStats | null>();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setMenuAnchor(null);
  };

  const handleToggleInput = (): void => {
    handleMenuClose();
    uiStore.toggleInputMethod();
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
            <MenuItem onClick={handleToggleInput}>
              <ListItemIcon>
                {uiStore.inputMethod === "buttons" ? (
                  <AdjustIcon fontSize="small" />
                ) : (
                  <AppsIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {uiStore.inputMethod === "buttons" ? "Use Dartboard" : "Use Buttons"}
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLeaveGame}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Leave Game</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        <X01ScoreDisplay game={game} />
      </Box>

      {/* Current visit + Checkout in a row */}
      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 1, px: 1, pb: 1 }}>
        <CurrentVisitDisplay visit={game.state.currentVisit} />
        <X01CheckoutDisplay suggestion={game.getCheckoutSuggestion()} />
      </Box>

      {/* Input area - takes remaining space */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 1, minHeight: 0 }}>
        {uiStore.inputMethod === "buttons" ? (
          <ButtonInput onThrow={handleThrow} onUndo={onUndo} />
        ) : (
          <DartboardInput onThrow={handleThrow} onUndo={onUndo} />
        )}
      </Box>

      {/* Winner dialog with X01-specific statistics */}
      <WinnerDialog
        open={uiStore.showWinnerDialog}
        winner={game.isFinished() ? game.getWinner() : getLegWinner()}
        isMatchWinner={game.isFinished()}
        currentLeg={game.state.currentLeg}
        onNextLeg={handleNextLeg}
        onNewGame={handleNewGame}
      >
        {playerNames.length > 0 && currentGameStats.size > 0 && (
          <X01Statistics
            playerNames={playerNames}
            currentGameStats={currentGameStats}
            allTimeStats={allTimeStats}
          />
        )}
      </WinnerDialog>
    </Box>
  );
});
