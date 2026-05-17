import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./auth/useAuth";
import { useThemeStore } from "./store/themeStore";

export function App() {
  const { loadUser, status } = useAuth();
  const { theme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (status === "signed-out" && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
    if (status === "signed-in" && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate, status]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-primary">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  return <Outlet />;
}
