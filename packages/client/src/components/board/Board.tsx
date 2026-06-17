import React, { useState, useEffect } from 'react';
import { BoardSVG } from './BoardSVG.js';
import { Piece } from './Piece.js';
import {
  type Position,
  PieceType,
  Player,
  MoveType,
  GameMode,
  type Move,
} from '@baghchal/shared';
import { useGameStore } from '../../stores/gameStore.js';
import { useUIStore } from '../../stores/uiStore.js';
import { getValidMoves } from '@baghchal/shared';

export const Board: React.FC = () => {
  const { gameState, mode, playerSide, playMove, isAILoading } = useGameStore();
  const { boardTheme } = useUIStore();
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMovesForSelected, setValidMovesForSelected] = useState<Move[]>([]);

  // Calculate coordinates for absolute positioning
  const getCoords = (pos: Position) => {
    return {
      left: `${pos.col * 25}%`,
      top: `${pos.row * 25}%`,
    };
  };

  // Reset selection on game change or turn change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPos(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValidMovesForSelected([]);
  }, [gameState.currentPlayer, gameState.moveCount]);

  // Find valid moves for selected piece
  useEffect(() => {
    if (!selectedPos) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValidMovesForSelected([]);
      return;
    }

    const allMoves = getValidMoves(gameState);
    const movesForPiece = allMoves.filter(
      (m) =>
        m.from &&
        m.from.row === selectedPos.row &&
        m.from.col === selectedPos.col
    );
    setValidMovesForSelected(movesForPiece);
  }, [selectedPos, gameState]);

  // Is it the user's turn to play?
  const isUserTurn = () => {
    if (mode === null || isAILoading || gameState.result !== null) return false;
    if (mode === GameMode.AI) {
      return gameState.currentPlayer === playerSide;
    }
    return true; // In local mode, both turns are active for the human
  };

  // Get valid placement positions for goats
  const getGoatPlacements = () => {
    if (gameState.currentPlayer !== Player.Goat || gameState.goatsPlaced >= 20) return [];
    
    const allMoves = getValidMoves(gameState);
    return allMoves.filter((m) => m.type === MoveType.Place);
  };

  const goatPlacements = isUserTurn() ? getGoatPlacements() : [];

  const handleCellClick = (row: number, col: number) => {
    if (!isUserTurn()) return;

    const clickedPiece = gameState.board[row * 5 + col];
    const playerSideForCurrentTurn = gameState.currentPlayer;

    // 1. Handle Goat placement phase
    if (
      playerSideForCurrentTurn === Player.Goat &&
      gameState.goatsPlaced < 20
    ) {
      const placement = goatPlacements.find(
        (m) => m.to.row === row && m.to.col === col
      );
      if (placement) {
        playMove(placement);
      }
      return;
    }

    // 2. Select own piece to move
    if (
      clickedPiece !== null &&
      ((playerSideForCurrentTurn === Player.Tiger && clickedPiece === PieceType.Tiger) ||
        (playerSideForCurrentTurn === Player.Goat && clickedPiece === PieceType.Goat))
    ) {
      // Toggle selection or select new
      if (selectedPos && selectedPos.row === row && selectedPos.col === col) {
        setSelectedPos(null);
      } else {
        setSelectedPos({ row, col });
      }
      return;
    }

    // 3. Make move with selected piece
    if (selectedPos) {
      const matchedMove = validMovesForSelected.find(
        (m) => m.to.row === row && m.to.col === col
      );
      if (matchedMove) {
        playMove(matchedMove);
        setSelectedPos(null);
      } else {
        // Deselect if clicked invalid non-own spot
        setSelectedPos(null);
      }
    }
  };

  // Helper to check if a position has a valid move targeting it
  const getMoveAtPosition = (row: number, col: number): Move | undefined => {
    return validMovesForSelected.find((m) => m.to.row === row && m.to.col === col);
  };

  // Helper to check if a position has a valid goat placement
  const isPlacementAtPosition = (row: number, col: number): boolean => {
    return goatPlacements.some((m) => m.to.row === row && m.to.col === col);
  };

  return (
    <div className="w-full max-w-[500px] aspect-square relative select-none mx-auto p-4 md:p-6 bg-slate-900/10 rounded-2xl">
      {/* Visual board background and grid lines */}
      <BoardSVG theme={boardTheme} />

      {/* Grid Coordinates Absolute Overlay */}
      <div className="absolute inset-[3.6%] md:inset-[5.4%] pointer-events-none">
        {/* Render interactive intersections / move indicators / pieces */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => {
            const index = row * 5 + col;
            const piece = gameState.board[index];
            const coords = getCoords({ row, col });
            const isSelected = selectedPos !== null && selectedPos.row === row && selectedPos.col === col;
            
            const move = getMoveAtPosition(row, col);
            const isPlacement = isPlacementAtPosition(row, col);

            return (
              <div
                key={`${row}-${col}`}
                style={{
                  ...coords,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute w-[14%] h-[14%] flex items-center justify-center pointer-events-auto z-10"
              >
                {/* Invisible Touch Hit Area (large target) */}
                <button
                  onClick={() => handleCellClick(row, col)}
                  className="absolute w-[150%] h-[150%] rounded-full focus:outline-none z-20 cursor-pointer"
                  aria-label={`Intersection row ${row + 1}, column ${col + 1}`}
                />

                {/* Render Piece if present */}
                {piece !== null && (
                  <div className="w-full h-full z-30 pointer-events-none">
                    <Piece
                      type={piece}
                      selected={isSelected}
                      disabled={isAILoading}
                    />
                  </div>
                )}

                {/* Render Move Indicators (valid destination spots) */}
                {move && (
                  <div className="absolute w-[35%] h-[35%] rounded-full z-40 pointer-events-none flex items-center justify-center animate-pulse">
                    {move.type === MoveType.Capture ? (
                      // Capture Indicator (Red Glow Ring)
                      <div className="w-full h-full rounded-full border-2 border-red-500 bg-red-600/35 scale-125" />
                    ) : (
                      // Regular Move Indicator (Green Dot)
                      <div className="w-full h-full rounded-full bg-emerald-400/80 border border-emerald-300" />
                    )}
                  </div>
                )}

                {/* Render Placement Indicators for Goats */}
                {isPlacement && (
                  <div className="absolute w-[30%] h-[30%] rounded-full bg-amber-400/40 border border-amber-300/60 z-40 pointer-events-none animate-pulse" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export { Board as default };
