export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type BoardSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Board = BoardSummary & {
  sceneJson: {
    elements?: JsonValue[];
    appState?: Record<string, JsonValue>;
    files?: Record<string, JsonValue>;
    [key: string]: JsonValue | undefined;
  };
};
