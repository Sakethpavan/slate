import { Excalidraw } from "@excalidraw/excalidraw";
import { ArrowLeft, Check, Cloud, Loader2, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../auth/useAuth";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import { useBoardStore } from "../store/boardStore";
import { useThemeStore } from "../store/themeStore";
import type { JsonValue } from "../types/slate";

type ScenePayload = {
  elements: JsonValue[];
  appState: Record<string, JsonValue>;
  files: Record<string, JsonValue>;
};

export function EditorPage() {
  const { boardId } = useParams();
  const { user } = useAuth();
  const { activeBoard, loadBoard, saveBoard, status } = useBoardStore();
  const { theme } = useThemeStore();
  const [title, setTitle] = useState("");
  const [dirty, setDirty] = useState(false);
  const activeBoardIdRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const lastSavedSceneRef = useRef("");
  const latestSceneRef = useRef<ScenePayload | null>(null);
  const titleRef = useRef("");

  useEffect(() => {
    if (boardId) {
      void loadBoard(boardId);
    }
  }, [boardId, loadBoard]);

  useEffect(() => {
    if (activeBoard) {
      setTitle(activeBoard.title);
      titleRef.current = activeBoard.title;
      activeBoardIdRef.current = activeBoard.id;
      latestSceneRef.current = sanitizeScene(activeBoard.sceneJson);
      lastSavedSceneRef.current = serializeScene(latestSceneRef.current);
    }
  }, [activeBoard?.id]);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const initialData = useMemo(() => {
    const scene = activeBoard?.sceneJson;

    return {
      elements: (scene?.elements ?? []) as unknown[],
      appState: sanitizeAppState(scene?.appState ?? {}),
      files: (scene?.files ?? {}) as Record<string, unknown>
    };
  }, [activeBoard?.id]);

  const saveLatestScene = useCallback(
    async (scene = latestSceneRef.current) => {
      const boardId = activeBoardIdRef.current;
      if (!boardId || !scene) {
        return;
      }

      await saveBoard({
        id: boardId,
        title: titleRef.current.trim() || "Untitled board",
        sceneJson: scene
      });
      lastSavedSceneRef.current = serializeScene(scene);
      setDirty(false);
    },
    [saveBoard]
  );

  const debouncedSave = useDebouncedCallback(
    (scene: ScenePayload) => {
      void saveLatestScene(scene);
    },
    3000
  );

  useEffect(() => {
    const flushWithKeepalive = () => {
      const boardId = activeBoardIdRef.current;
      const scene = latestSceneRef.current;

      if (!dirtyRef.current || !boardId || !scene) {
        return;
      }

      void fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        credentials: "include",
        keepalive: true,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: titleRef.current.trim() || "Untitled board",
          sceneJson: scene
        })
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushWithKeepalive();
      }
    };

    window.addEventListener("pagehide", flushWithKeepalive);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushWithKeepalive);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleSceneChange = useCallback(
    (elements: readonly unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
      const scene = {
        elements: toJsonValue(elements, []) as JsonValue[],
        appState: sanitizeAppState(appState) as Record<string, JsonValue>,
        files: toJsonValue(files, {}) as Record<string, JsonValue>
      };
      const serializedScene = serializeScene(scene);

      if (serializedScene === lastSavedSceneRef.current) {
        return;
      }

      latestSceneRef.current = scene;
      setDirty(true);
      debouncedSave(scene);
    },
    [debouncedSave]
  );

  const handleTitleBlur = () => {
    if (!activeBoard || title.trim() === activeBoard.title) {
      return;
    }

    void saveBoard({
      id: activeBoard.id,
      title: title.trim() || "Untitled board",
      sceneJson: latestSceneRef.current ?? sanitizeScene(activeBoard.sceneJson)
    });
  };

  return (
    <main className="min-h-screen bg-canvas text-primary">
      <Header
        user={user}
        rightSlot={
          <Link
            to="/"
            className="grid h-9 w-9 place-items-center rounded border border-soft hover:bg-primary hover:text-inverse"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft size={17} aria-hidden />
          </Link>
        }
      />

      <section className="flex h-16 items-center justify-between border-b border-soft bg-surface px-4">
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <Pencil size={17} className="shrink-0 text-muted" aria-hidden />
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleBlur}
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
            aria-label="Board title"
          />
        </label>
        <SaveStatus status={status} dirty={dirty} />
      </section>

      <section className="excalidraw-wrapper bg-surface">
        {activeBoard ? (
          <Excalidraw
            key={activeBoard.id}
            initialData={initialData as never}
            onChange={handleSceneChange as never}
            theme={theme}
            UIOptions={{
              canvasActions: {
                loadScene: false
              }
            }}
          />
        ) : (
          <div className="grid h-full place-items-center">
            <Loader2 className="animate-spin text-ink/50" size={28} aria-hidden />
          </div>
        )}
      </section>
    </main>
  );
}

function sanitizeScene(scene: { elements?: unknown; appState?: Record<string, unknown>; files?: unknown }): ScenePayload {
  return {
    elements: toJsonValue(scene.elements ?? [], []) as JsonValue[],
    appState: sanitizeAppState(scene.appState ?? {}) as Record<string, JsonValue>,
    files: toJsonValue(scene.files ?? {}, {}) as Record<string, JsonValue>
  };
}

function serializeScene(scene: ScenePayload) {
  return JSON.stringify(scene);
}

function sanitizeAppState(appState: Record<string, unknown>) {
  const { collaborators: _collaborators, ...rest } = appState;
  return toJsonValue(rest, {}) as Record<string, unknown>;
}

function toJsonValue(value: unknown, fallback: JsonValue): JsonValue | any {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item, null));
  }

  if (typeof value === "object") {
    if (value instanceof Map || value instanceof Set || value instanceof File) {
      return fallback;
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => typeof item !== "undefined" && typeof item !== "function")
        .map(([key, item]) => [key, toJsonValue(item, null)])
    );
  }

  return fallback;
}

function SaveStatus({ status, dirty }: { status: string; dirty: boolean }) {
  if (status === "saving" || dirty) {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded bg-info px-3 text-sm font-medium text-primary">
        <Cloud size={16} aria-hidden />
        Autosaving
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded bg-accent px-3 text-sm font-medium text-inverse">
        <Check size={16} aria-hidden />
        Saved
      </span>
    );
  }

  return (
    <span className="inline-flex h-9 items-center gap-2 rounded border border-soft px-3 text-sm font-medium text-muted">
      <Check size={16} aria-hidden />
      Ready
    </span>
  );
}
