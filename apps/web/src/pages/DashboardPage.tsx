import { FilePlus2, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../auth/useAuth";
import { useBoardStore } from "../store/boardStore";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { boards, createBoard, deleteBoard, loadBoards, status } = useBoardStore();
  const [title, setTitle] = useState("Untitled board");

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const board = await createBoard(title.trim() || "Untitled board");
    navigate(`/boards/${board.id}`);
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header user={user} />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase text-moss">Recent boards</p>
            <h1 className="mt-2 text-3xl font-semibold">Your workspace</h1>
          </div>

          <form onSubmit={handleCreate} className="flex w-full gap-2 sm:w-auto">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 min-w-0 flex-1 rounded border border-ink/15 bg-white px-3 outline-none focus:border-moss sm:w-64"
              aria-label="Board title"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded bg-ink px-4 font-medium text-paper hover:bg-moss"
            >
              <FilePlus2 size={18} aria-hidden />
              Create
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <article key={board.id} className="rounded border border-ink/10 bg-white p-4 shadow-sm">
              <Link to={`/boards/${board.id}`} className="block">
                <h2 className="truncate text-lg font-semibold">{board.title}</h2>
                <p className="mt-2 text-sm text-ink/60">Updated {formatDate(board.updatedAt)}</p>
              </Link>
              <button
                type="button"
                onClick={() => void deleteBoard(board.id)}
                className="mt-5 grid h-9 w-9 place-items-center rounded border border-ink/10 text-ink/65 hover:border-clay hover:text-clay"
                aria-label={`Delete ${board.title}`}
                title="Delete board"
              >
                <Trash2 size={17} aria-hidden />
              </button>
            </article>
          ))}
        </div>

        {boards.length === 0 && status !== "loading" ? (
          <div className="mt-16 border-y border-ink/10 py-16 text-center">
            <h2 className="text-2xl font-semibold">No boards yet</h2>
            <p className="mt-3 text-ink/65">Create your first board and start sketching.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
