import { create } from "zustand";
import { api } from "../api/client";
import type { Board, BoardSummary } from "../types/slate";

type BoardStatus = "idle" | "loading" | "saving" | "saved" | "error";

type BoardState = {
  boards: BoardSummary[];
  activeBoard: Board | null;
  status: BoardStatus;
  error: string | null;
  loadBoards: () => Promise<void>;
  createBoard: (title: string) => Promise<Board>;
  loadBoard: (id: string) => Promise<Board>;
  saveBoard: (board: Pick<Board, "id" | "title" | "sceneJson">) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
};

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  activeBoard: null,
  status: "idle",
  error: null,
  loadBoards: async () => {
    set({ status: "loading", error: null });
    try {
      const boards = await api.boards();
      set({ boards, status: "idle" });
    } catch (error) {
      set({ status: "error", error: getError(error) });
    }
  },
  createBoard: async (title: string) => {
    set({ status: "loading", error: null });
    try {
      const board = await api.createBoard(title);
      set((state) => ({
        activeBoard: board,
        boards: [toSummary(board), ...state.boards],
        status: "idle"
      }));
      return board;
    } catch (error) {
      set({ status: "error", error: getError(error) });
      throw error;
    }
  },
  loadBoard: async (id: string) => {
    set({ status: "loading", error: null });
    try {
      const board = await api.getBoard(id);
      set({ activeBoard: board, status: "idle" });
      return board;
    } catch (error) {
      set({ status: "error", error: getError(error) });
      throw error;
    }
  },
  saveBoard: async (board) => {
    set({ status: "saving", error: null });
    try {
      const saved = await api.updateBoard(board);
      set({
        activeBoard: saved,
        boards: get().boards.map((item) => (item.id === saved.id ? toSummary(saved) : item)),
        status: "saved"
      });
      return saved;
    } catch (error) {
      set({ status: "error", error: getError(error) });
      throw error;
    }
  },
  deleteBoard: async (id: string) => {
    set({ status: "loading", error: null });
    await api.deleteBoard(id);
    set((state) => ({
      boards: state.boards.filter((board) => board.id !== id),
      activeBoard: state.activeBoard?.id === id ? null : state.activeBoard,
      status: "idle"
    }));
  }
}));

function toSummary(board: Board): BoardSummary {
  return {
    id: board.id,
    title: board.title,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt
  };
}

function getError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}
