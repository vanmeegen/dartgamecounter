/**
 * AroundTheWorldPlayView - complete gameplay view for Around the World
 */

import { useState, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AppsIcon from "@mui/icons-material/Apps";
import AdjustIcon from "@mui/icons-material/Adjust";
import { useStores } from "../../hooks/useStores";
import { ButtonInput } from "../../shared/components/input";
import { DartboardInput } from "../../shared/components/dartboard";
import { CurrentVisitDisplay } from "../../shared/components/CurrentVisitDisplay";
import { WinnerDialog } from "../../shared/components/dialogs";
import { AroundTheWorldScoreDisplay } from "./AroundTheWorldScoreDisplay";
import type { GamePlayComponentProps } from "../types";
import type { AroundTheWorldGame } from "./AroundTheWorldGame";

export const AroundTheWorldPlayView = observer(function AroundTheWorldPlayView({
  game: baseGame,
  onThrow,
  onUndo,
  onLegFinished,
  onLeaveGame,
  onNewGame,
}: GamePlayComponentProps): JSX.Element {
  const { uiStore } = useStores();
  const game = baseGame as AroundTheWorldGame;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleThrow = (segment: number, multiplier: 1 | 2 | 3): void => {
    onThrow(segment, multiplier);
    if (game.isLegFinished()) onLegFinished();
  };

  const handleNextLeg = (): void => {
    uiStore.closeWinnerDialog();
    game.nextLeg();
  };

  const handleNewGame = (): void => {
    uiStore.closeWinnerDialog();
    onNewGame();
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0, position: "relative" }}>
        <Box sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}>
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MenuIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                uiStore.toggleInputMethod();
              }}
            >
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
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onLeaveGame();
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Leave Game</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        <AroundTheWorldScoreDisplay game={game} />
      </Box>

      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 1, px: 1, pb: 1 }}>
        <CurrentVisitDisplay
          visit={game.currentVisit}
          lastCompletedVisit={game.lastCompletedVisit}
        />
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 1, minHeight: 0 }}>
        {uiStore.inputMethod === "buttons" ? (
          <ButtonInput onThrow={handleThrow} onUndo={onUndo} />
        ) : (
          <DartboardInput onThrow={handleThrow} onUndo={onUndo} />
        )}
      </Box>

      <WinnerDialog
        open={uiStore.showWinnerDialog}
        winner={game.getWinner()}
        isMatchWinner={game.isFinished()}
        currentLeg={game.currentLeg}
        onNextLeg={handleNextLeg}
        onNewGame={handleNewGame}
      />
    </Box>
  );
});
