import { create } from 'zustand';
import {
  type GameState,
  type Move,
  GameMode,
  Player,
  AILevel,
  createInitialState,
  makeMove,
} from '@baghchal/shared';
import { AIEngine } from '@baghchal/shared';

// Create a single stable instance of AIEngine
const aiEngine = new AIEngine();

interface GameStore {
  gameState: GameState;
  mode: GameMode | null;
  aiLevel: AILevel;
  playerSide: Player; // The side the user plays in AI mode (TIGER or GOAT)
  isAILoading: boolean;
  history: GameState[]; // History of game states for undo/redo
  historyIndex: number;
  
  startGame: (mode: GameMode, config?: { aiLevel?: AILevel; playerSide?: Player }) => void;
  playMove: (move: Move) => Promise<void>;
  triggerAIMove: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialState(),
  mode: null,
  aiLevel: AILevel.Medium,
  playerSide: Player.Goat, // Traditional start for human: goats are placed
  isAILoading: false,
  history: [createInitialState()],
  historyIndex: 0,

  startGame: (mode, config = {}) => {
    const initialState = createInitialState();
    const side = config.playerSide ?? Player.Goat;
    const level = config.aiLevel ?? AILevel.Medium;

    set({
      gameState: initialState,
      mode,
      aiLevel: level,
      playerSide: side,
      isAILoading: false,
      history: [initialState],
      historyIndex: 0,
    });

    // If the AI is the starting player, trigger the first move
    if (mode === GameMode.AI && initialState.currentPlayer !== side) {
      get().triggerAIMove();
    }
  },

  playMove: async (move) => {
    const { gameState, mode, playerSide, isAILoading, history, historyIndex } = get();
    
    // Prevent moves if game is loading, over, or not started
    if (isAILoading || gameState.result !== null || mode === null) return;
    
    // In AI mode, verify it's the human's turn
    if (mode === GameMode.AI && gameState.currentPlayer !== playerSide) return;

    try {
      const nextState = makeMove(gameState, move);
      const newHistory = history.slice(0, historyIndex + 1).concat(nextState);
      
      set({
        gameState: nextState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });

      // If AI mode and game is still running, let the AI play
      if (mode === GameMode.AI && nextState.result === null && nextState.currentPlayer !== playerSide) {
        await get().triggerAIMove();
      }
    } catch (err) {
      console.error('Invalid move attempted:', err);
    }
  },

  triggerAIMove: async () => {
    const { gameState, mode, aiLevel } = get();
    if (mode !== GameMode.AI || gameState.result !== null) return;

    set({ isAILoading: true });

    try {
      // Small timeout to allow UI thread to paint the user's move first
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      const bestMove = await aiEngine.getBestMove(gameState, aiLevel, 4000);
      const nextState = makeMove(get().gameState, bestMove);
      const currentHistory = get().history;
      const newHistory = currentHistory.slice(0, get().historyIndex + 1).concat(nextState);

      set({
        gameState: nextState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isAILoading: false,
      });
    } catch (err) {
      console.error('AI search failed:', err);
      set({ isAILoading: false });
    }
  },

  undo: () => {
    const { history, historyIndex, mode, playerSide } = get();
    
    if (mode === GameMode.AI) {
      // In AI mode, we need to undo two moves to revert back to the user's turn.
      // We look back to find the latest state where currentPlayer matches playerSide.
      let targetIdx = historyIndex;
      
      while (targetIdx > 0) {
        targetIdx--;
        const state = history[targetIdx];
        if (state.currentPlayer === playerSide) {
          set({
            gameState: state,
            historyIndex: targetIdx,
          });
          return;
        }
      }
      
      // If we couldn't find playerSide state but index 0 is valid, reset to 0
      if (history.length > 0) {
        set({
          gameState: history[0],
          historyIndex: 0,
        });
        
        // If the AI is the starting player, trigger the first move again
        if (history[0].currentPlayer !== playerSide) {
          get().triggerAIMove();
        }
      }
    } else {
      // In local mode, just undo one move
      if (historyIndex > 0) {
        const targetIdx = historyIndex - 1;
        set({
          gameState: history[targetIdx],
          historyIndex: targetIdx,
        });
      }
    }
  },

  redo: () => {
    const { history, historyIndex, mode } = get();
    
    if (mode === GameMode.AI) {
      // In AI mode, we redo two moves to keep the flow synchronized (user move + AI reply)
      if (historyIndex + 2 < history.length) {
        const targetIdx = historyIndex + 2;
        set({
          gameState: history[targetIdx],
          historyIndex: targetIdx,
        });
      }
    } else {
      // In local mode, just redo one move
      if (historyIndex < history.length - 1) {
        const targetIdx = historyIndex + 1;
        set({
          gameState: history[targetIdx],
          historyIndex: targetIdx,
        });
      }
    }
  },

  resetGame: () => {
    const { mode, aiLevel, playerSide } = get();
    if (mode !== null) {
      get().startGame(mode, { aiLevel, playerSide });
    }
  },
}));
export { aiEngine };
