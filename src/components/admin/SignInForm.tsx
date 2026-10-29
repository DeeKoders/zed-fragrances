"use client";

import { useActionState, useId } from "react";
import { signIn, type SignInState } from "@/app/admin/actions";
import { Logo } from "@/components/ui/Logo";
import { admin } from "@/config/admin";

const copy = admin.copy.signIn;
const initialState: SignInState = { error: null };

/** Password sign-in for the admin portal. */
export function SignInForm({ configured }: { configured: boolean }) {
  const inputId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(signIn, initialState);
  const error = configured ? state.error : copy.notConfigured;

  return (
    <div className="grid min-h-svh place-items-center px-4 py-16">
      <form action={action} className="w-full max-w-sm border border-line bg-ink-900 px-6 py-10 sm:px-8">
        <Logo href={null} sizes="112px" eager className="mx-auto w-28" />
        <p className="mt-8 text-center text-micro uppercase text-ivory-muted">{admin.copy.portal}</p>
        <h1 className="mt-2 text-center font-display text-h3 uppercase">{copy.title}</h1>

        <label htmlFor={inputId} className="mt-8 block text-micro uppercase text-ivory-muted">
          {copy.password}
        </label>
        <input
          id={inputId}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={!configured}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="mt-2 block w-full border border-line bg-ink-950/60 px-4 py-3 text-body text-ivory transition-colors focus:border-gold-300 focus:outline-none disabled:opacity-50"
        />
        {error && (
          <p id={errorId} role="alert" className="mt-3 text-sm text-ivory">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending || !configured}
          className="mt-6 flex w-full items-center justify-center bg-gold-300 px-6 py-4 text-label uppercase text-ink-950 transition-colors hover:bg-gold-200 disabled:opacity-60"
        >
          {pending ? copy.pending : copy.submit}
        </button>
      </form>
    </div>
  );
}
