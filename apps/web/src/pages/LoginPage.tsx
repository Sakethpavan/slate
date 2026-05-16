import { PanelsTopLeft } from "lucide-react";

export function LoginPage() {
  return (
    <main className="grid min-h-screen bg-paper text-ink lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col justify-between px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded bg-ink text-paper">
            <PanelsTopLeft size={20} aria-hidden />
          </span>
          <span className="text-xl font-semibold">Slate</span>
        </div>

        <div className="max-w-xl py-24">
          <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">Draw now. Find it later.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-ink/70">
            A focused Excalidraw workspace for boards that autosave to your account and reopen exactly where you left them.
          </p>
          <a
            href="/oauth2/authorization/google"
            className="mt-9 inline-flex h-12 items-center justify-center rounded bg-ink px-5 font-medium text-paper hover:bg-moss"
          >
            Continue with Google
          </a>
        </div>

        <p className="text-sm text-ink/55">Local development uses a built-in dev user until Google OAuth credentials are configured.</p>
      </section>

      <section className="hidden min-h-screen bg-sky p-8 lg:block">
        <div className="h-full rounded border border-ink/10 bg-[#fcfbf7] p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-ink/10 pb-5">
            <span className="text-sm font-medium uppercase tracking-wider text-ink/55">Untitled board</span>
            <span className="rounded bg-moss px-3 py-1 text-sm text-paper">Autosaved</span>
          </div>
          <div className="relative h-[calc(100%-64px)]">
            <div className="absolute left-[18%] top-[18%] h-28 w-52 rotate-[-3deg] rounded border-2 border-clay bg-clay/10" />
            <div className="absolute right-[18%] top-[27%] h-24 w-44 rotate-2 rounded border-2 border-moss bg-moss/10" />
            <div className="absolute bottom-[26%] left-[24%] h-20 w-64 rounded-full border-2 border-ink/60" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 680" fill="none" aria-hidden>
              <path d="M250 225 C360 165 382 365 482 246" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
              <path d="M350 455 C425 390 480 435 538 356" stroke="#b46d4f" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>
    </main>
  );
}
