import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BookMarked, LoaderCircle, LogOut, Mail, Pencil, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { PopButton, PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { deleteAccount, signIn, signOut, signUp, updateUsername, useProfile } from "@/lib/auth";
import { useMemories } from "@/lib/memories";

const inputClass =
  "w-full rounded-2xl border-[2.5px] border-ink bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-marigold/50";

type Mode = "signIn" | "signUp";

function AuthForms() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result =
      mode === "signUp" ? await signUp(email, password, username) : await signIn(email, password);
    setMessage(result.message);
    setBusy(false);
  }

  return (
    <div className="sticker-lg mx-auto max-w-md rounded-3xl bg-white p-6 sm:p-8">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("signIn");
            setMessage("");
          }}
          aria-pressed={mode === "signIn"}
          className={`h-10 flex-1 rounded-full border-2 text-sm font-semibold transition-colors ${
            mode === "signIn"
              ? "border-ink bg-chakra text-white"
              : "border-transparent text-ink-soft"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signUp");
            setMessage("");
          }}
          aria-pressed={mode === "signUp"}
          className={`h-10 flex-1 rounded-full border-2 text-sm font-semibold transition-colors ${
            mode === "signUp"
              ? "border-ink bg-chakra text-white"
              : "border-transparent text-ink-soft"
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-4">
        {mode === "signUp" ? (
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
            Username
            <input
              required
              minLength={3}
              maxLength={24}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="king_of_puzzles"
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        <PopButton type="submit" tone="saffron" size="lg" disabled={busy} className="mt-2">
          {busy ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : mode === "signUp" ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </PopButton>
      </form>

      {message ? (
        <p role="status" className="mt-4 text-base leading-snug text-ink-soft">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function UsernameField({ userId, username }: { userId: string; username: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    const result = await updateUsername(userId, value.trim());
    setMessage(result.ok ? "" : result.message);
    setBusy(false);
    if (result.ok) setEditing(false);
  }

  if (!editing) {
    return (
      <h2 className="mt-4 flex items-center justify-center gap-2 font-display text-2xl font-extrabold tracking-tight">
        {username ?? "Signed in"}
        <button
          type="button"
          onClick={() => {
            // Start the field from the current username each time editing begins, rather than
            // syncing `value` to it continuously — there is nothing to keep in sync while the
            // field isn't shown.
            setValue(username ?? "");
            setEditing(true);
          }}
          aria-label="Edit username"
          className="text-ink-soft hover:text-chakra"
        >
          <Pencil className="size-5" aria-hidden="true" />
        </button>
      </h2>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-2">
        <input
          autoFocus
          minLength={3}
          maxLength={24}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-44 rounded-full border-[2.5px] border-ink bg-white px-4 py-2 text-center text-lg font-extrabold outline-none focus:ring-4 focus:ring-marigold/50"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy || value.trim().length < 3}
          className="pop sticker flex size-10 items-center justify-center rounded-full bg-leaf text-white disabled:opacity-50"
          aria-label="Save username"
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Pencil className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {message ? <p className="mt-2 text-sm text-sindoor">{message}</p> : null}
    </div>
  );
}

function ImportLocalRuns({ userId }: { userId: string }) {
  const memories = useMemories();
  const [checking, setChecking] = useState(true);
  const [hasCloud, setHasCloud] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{ synced: number; failed: number } | null>(null);

  useEffect(() => {
    let active = true;
    import("@/lib/cloudRuns").then(({ hasCloudRuns }) =>
      hasCloudRuns(userId).then((has) => {
        if (active) {
          setHasCloud(has);
          setChecking(false);
        }
      }),
    );
    return () => {
      active = false;
    };
  }, [userId]);

  if (memories.length === 0 || checking) return null;

  const count = memories.length;
  const plural = count === 1 ? "run" : "runs";

  if (result) {
    return (
      <p className="mt-6 text-base text-leaf">
        Synced {result.synced} {result.synced === 1 ? "run" : "runs"} to your account
        {result.failed > 0 ? ` (${result.failed} failed — try again later).` : "."}
      </p>
    );
  }

  async function runImport() {
    setImporting(true);
    const { importLocalRuns } = await import("@/lib/cloudRuns");
    const outcome = await importLocalRuns(memories, (done, total) => setProgress({ done, total }));
    setResult(outcome);
    setImporting(false);
  }

  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-ink/40 p-4 text-left">
      <p className="text-base text-ink-soft">
        {hasCloud
          ? `Sync ${count} ${plural} saved on this device to your account.`
          : `You have ${count} ${plural} saved on this device — import them to your account?`}
      </p>
      <PopButton
        tone={hasCloud ? "white" : "saffron"}
        size="md"
        className="mt-3"
        disabled={importing}
        onClick={() => void runImport()}
      >
        {importing ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Syncing {progress.done}/{progress.total}…
          </>
        ) : hasCloud ? (
          "Sync local runs"
        ) : (
          `Import ${count} ${plural}`
        )}
      </PopButton>
    </div>
  );
}

function DeleteAccount({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Permanently delete your account, cloud runs and photos? This cannot be undone. Polaroids already saved on this device are not affected.",
    );
    if (!confirmed) return;
    setBusy(true);
    setMessage("");
    const result = await deleteAccount(userId);
    if (result.ok) {
      navigate("/");
    } else {
      setMessage(result.message);
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 border-t-2 border-dashed border-ink/15 pt-6">
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-sindoor hover:underline disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="size-4" aria-hidden="true" />
        )}
        Delete account
      </button>
      {message ? <p className="mt-2 text-sm text-sindoor">{message}</p> : null}
    </div>
  );
}

function SignedIn({
  email,
  userId,
  username,
}: {
  email: string;
  userId: string;
  username: string | null;
}) {
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="sticker-lg mx-auto max-w-md rounded-3xl bg-white p-6 text-center sm:p-8">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-leaf text-white shadow-pop-sm">
        <User className="size-7" aria-hidden="true" />
      </span>
      <UsernameField userId={userId} username={username} />
      <p className="mt-1 flex items-center justify-center gap-2 text-base text-ink-soft">
        <Mail className="size-4" aria-hidden="true" />
        {email}
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        Runs you solve from here on sync to your account automatically.
      </p>
      <ImportLocalRuns userId={userId} />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <PopLink to="/profile" tone="chakra" size="lg">
          <BookMarked className="size-5" aria-hidden="true" />
          View your passport
        </PopLink>
        <PopButton
          tone="white"
          size="lg"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut();
          }}
        >
          <LogOut className="size-5" aria-hidden="true" />
          Sign out
        </PopButton>
      </div>
      <DeleteAccount userId={userId} />
    </div>
  );
}

export default function AccountPage() {
  const { session, loading, username } = useProfile();

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Account"
        description="Sign in to PinchPop to sync your runs and photos across devices."
        path="/account"
        noIndex
      />
      <h1 className="text-center font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-tighter">
        Account
      </h1>
      <p className="mx-auto mt-4 max-w-md text-center text-lg leading-relaxed text-ink-soft">
        Playing without an account works fully offline. Sign in to sync your runs across devices.
      </p>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center">
            <Chakra spokes={24} className="size-10 animate-spin text-chakra" />
          </div>
        ) : session ? (
          <SignedIn email={session.user.email ?? ""} userId={session.user.id} username={username} />
        ) : (
          <AuthForms />
        )}
      </div>
    </div>
  );
}
