import { LogOut, PanelsTopLeft } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";
import type { User } from "../types/slate";

type HeaderProps = {
  user: User | null;
  rightSlot?: React.ReactNode;
};

export function Header({ user, rightSlot }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-ink/10 bg-paper px-5">
      <Link to="/" className="flex items-center gap-3 text-ink">
        <span className="grid h-9 w-9 place-items-center rounded bg-ink text-paper">
          <PanelsTopLeft size={19} aria-hidden />
        </span>
        <span className="text-lg font-semibold">Slate</span>
      </Link>

      <div className="flex items-center gap-3">
        {rightSlot}
        {user ? (
          <div className="flex items-center gap-3 text-sm text-ink/75">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-sky text-xs font-semibold text-ink">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
            <a
              href="/logout"
              aria-label="Sign out"
              title="Sign out"
              className="grid h-9 w-9 place-items-center rounded border border-ink/15 hover:bg-ink hover:text-paper"
            >
              <LogOut size={17} aria-hidden />
            </a>
          </div>
        ) : null}
      </div>
    </header>
  );
}
