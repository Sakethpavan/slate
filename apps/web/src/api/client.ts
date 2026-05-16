import type { Board, BoardSummary, User } from "../types/slate";

const jsonHeaders = {
  "Content-Type": "application/json"
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? jsonHeaders : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  me: () => request<User>("/api/me"),
  boards: () => request<BoardSummary[]>("/api/boards"),
  createBoard: (title: string) =>
    request<Board>("/api/boards", {
      method: "POST",
      body: JSON.stringify({ title })
    }),
  getBoard: (id: string) => request<Board>(`/api/boards/${id}`),
  updateBoard: (board: Pick<Board, "id" | "title" | "sceneJson">) =>
    request<Board>(`/api/boards/${board.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: board.title,
        sceneJson: board.sceneJson
      })
    }),
  deleteBoard: (id: string) =>
    request<void>(`/api/boards/${id}`, {
      method: "DELETE"
    })
};
