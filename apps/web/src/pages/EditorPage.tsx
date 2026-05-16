import { Excalidraw } from "@excalidraw/excalidraw";
import { ArrowLeft, Check, Cloud, Loader2, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../auth/useAuth";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import { useBoardStore } from "../store/boardStore";
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
  const [title, setTitle] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (boardId) {
      void loadBoard(boardId);
    }
  }, [boardId, loadBoard]);

  useEffect(() => {
    if (activeBoard) {
      setTitle(activeBoard.title);
    }
  }, [activeBoard?.id]);

  const initialData = useMemo(() => {
    const scene = activeBoard?.sceneJson;

    return {
      elements: (scene?.elements ?? []) as unknown[],
      appState: (scene?.appState ?? {}) as Record<string, unknown>,
      files: (scene?.files ?? {}) as Record<string, unknown>
    };
  }, [activeBoard?.id]);

  const debouncedSave = useDebouncedCallback(
    (scene: ScenePayload) => {
      if (!activeBoard) {
        return;
      }

      void saveBoard({
        id: activeBoard.id,
        title,
        sceneJson: scene
      }).then(() => setDirty(false));
    },
    3000
  );

  const handleSceneChange = useCallback(
    (elements: readonly unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
      setDirty(true);
      debouncedSave({
        elements: elements as JsonValue[],
        appState: appState as Record<string, JsonValue>,
        files: files as Record<string, JsonValue>
      });
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
      sceneJson: activeBoard.sceneJson
    });
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header
        user={user}
        rightSlot={
          <Link
            to="/"
            className="grid h-9 w-9 place-items-center rounded border border-ink/15 hover:bg-ink hover:text-paper"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft size={17} aria-hidden />
          </Link>
        }
      />

      <section className="flex h-16 items-center justify-between border-b border-ink/10 bg-white px-4">
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <Pencil size={17} className="shrink-0 text-ink/45" aria-hidden />
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

      <section className="excalidraw-wrapper bg-white">
        {activeBoard ? (
          <Excalidraw
            key={activeBoard.id}
            initialData={initialData as never}
            onChange={handleSceneChange as never}
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

function SaveStatus({ status, dirty }: { status: string; dirty: boolean }) {
  if (status === "saving" || dirty) {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded bg-sky px-3 text-sm font-medium text-ink">
        <Cloud size={16} aria-hidden />
        Autosaving
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded bg-moss px-3 text-sm font-medium text-paper">
        <Check size={16} aria-hidden />
        Saved
      </span>
    );
  }

  return (
    <span className="inline-flex h-9 items-center gap-2 rounded border border-ink/10 px-3 text-sm font-medium text-ink/60">
      <Check size={16} aria-hidden />
      Ready
    </span>
  );
}
