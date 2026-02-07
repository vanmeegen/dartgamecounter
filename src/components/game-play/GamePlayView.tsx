/**
 * GamePlayView - delegates to the game-specific PlayComponent from the registry
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Container from "@mui/material/Container";
import { useStores } from "../../hooks/useStores";

export const GamePlayView = observer(function GamePlayView(): JSX.Element {
  const { gameStore, uiStore } = useStores();
  const game = gameStore.currentGame;
  const definition = gameStore.currentGameDefinition;

  if (!game || !definition) {
    return (
      <Container maxWidth="sm" sx={{ py: 3, textAlign: "center" }}>
        No game in progress.
      </Container>
    );
  }

  const handleThrow = (segment: number, multiplier: 1 | 2 | 3): void => {
    game.recordThrow({ segment, multiplier });
  };

  const handleUndo = (): void => {
    game.undoLastThrow();
  };

  const handleLegFinished = (): void => {
    uiStore.openWinnerDialog();
  };

  const handleLeaveGame = (): void => {
    gameStore.endGame();
    uiStore.goToPlayerSetup();
  };

  const handleNewGame = (): void => {
    gameStore.endGame();
    uiStore.goToPlayerSetup();
  };

  const PlayComponent = definition.PlayComponent;

  return (
    <PlayComponent
      game={game}
      onThrow={handleThrow}
      onUndo={handleUndo}
      onLegFinished={handleLegFinished}
      onLeaveGame={handleLeaveGame}
      onNewGame={handleNewGame}
    />
  );
});
