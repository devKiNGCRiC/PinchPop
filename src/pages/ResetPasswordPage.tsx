import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { PopButton, PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { updatePassword, useSession } from "@/lib/auth";

const inputClass =
  "w-full rounded-2xl border-[2.5px] border-ink bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-marigold/50";

/** Supabase sends a player back here with an error in the URL when the reset link is expired or
 * already used. Read it before the Supabase client clears the URL. */
function readLinkError(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  if (!params.get("error") && !params.get("error_code")) return null;
  return "This reset link has expired or was already used. Ask for a new one below.";
}

function NewPasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setMessage("The two passwords don't match.");
      return;
    }
    setBusy(true);
    setMessage("");
    const result = await updatePassword(password);
    setBusy(false);
    if (result.ok) {
      navigate("/account", { replace: true });
      return;
    }
    setMessage(result.message);
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="sticker-lg mx-auto flex max-w-md flex-col gap-4 rounded-3xl bg-white p-6 sm:p-8"
    >
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
        New password
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-3 flex items-center text-ink-soft hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
        Type it again
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </label>
      <PopButton type="submit" tone="saffron" size="lg" disabled={busy} className="mt-2">
        {busy ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          "Save new password"
        )}
      </PopButton>
      {message ? (
        <p role="status" className="text-base leading-snug text-ink-soft">
          {message}
        </p>
      ) : null}
    </form>
  );
}

export default function ResetPasswordPage() {
  const { session, loading } = useSession();
  const [linkError] = useState(readLinkError);

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Choose a new password"
        description="Set a new password for your PinchPop account."
        path="/reset-password"
        noIndex
      />
      <h1 className="text-center font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-tighter">
        New password
      </h1>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center">
            <Chakra spokes={24} className="size-10 animate-spin text-chakra" />
          </div>
        ) : session && !linkError ? (
          <NewPasswordForm />
        ) : (
          <div className="mx-auto max-w-md text-center">
            <p className="text-lg leading-relaxed text-ink-soft">
              {linkError ??
                "Open the reset link from your email to choose a new password. If it isn't working, ask for a new one."}
            </p>
            <PopLink to="/account" tone="saffron" size="lg" className="mt-6">
              Back to sign in
            </PopLink>
          </div>
        )}
      </div>
    </div>
  );
}
