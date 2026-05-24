import { LogOut, Moon, PanelsTopLeft, Sun } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config";
import { useThemeStore } from "../store/themeStore";
import type { User } from "../types/slate";

type HeaderProps = {
  user: User | null;
  rightSlot?: React.ReactNode;
};

export function Header({ user, rightSlot }: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-soft bg-canvas px-5 text-primary">
      <Link to="/" className="flex items-center gap-3 text-primary">
        <span className="grid h-9 w-9 place-items-center rounded bg-primary text-inverse">
          <PanelsTopLeft size={19} aria-hidden />
        </span>
        <span className="text-lg font-semibold">Slate</span>
      </Link>

      <div className="flex items-center gap-3">
        {rightSlot}
        <button
          type="button"
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded border border-soft hover:bg-primary hover:text-inverse"
          aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}
          title={theme === "dark" ? "Use light theme" : "Use dark theme"}
        >
          {theme === "dark" ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
        </button>
        {user ? (
          <div className="flex items-center gap-3 text-sm text-muted">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-info text-xs font-semibold text-primary">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
            <a
              href={apiUrl("/logout")}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-9 w-9 place-items-center rounded border border-soft hover:bg-primary hover:text-inverse"
            >
              <LogOut size={17} aria-hidden />
            </a>
          </div>
        ) : null}
      </div>
    </header>
  );
}
