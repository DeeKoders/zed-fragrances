"use client";

import { useId, useState, type FormEvent } from "react";
import { brand } from "@/config/brand";
import { subscribe } from "@/lib/newsletter";

type Status = "idle" | "sending" | "done" | "error";

/** Newsletter sign-up (UI only; the handler in src/lib/newsletter.ts is a placeholder). */
export function NewsletterForm() {
  const copy = brand.copy.footer.newsletter;
  const inputId = useId();
  const statusId = useId();
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setStatus("sending");
    try {
      await subscribe(email);
      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate={false} className="mt-6" aria-describedby={statusId}>
      <label htmlFor={inputId} className="sr-only">
        {copy.label}
      </label>
      <div className="flex border-b border-gold-700 focus-within:border-gold-300">
        <input
          id={inputId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={copy.placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 text-body text-ivory placeholder:text-ivory-muted/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-2 text-label uppercase text-gold-200 transition-colors hover:text-gold-100 disabled:opacity-50"
        >
          {copy.submit}
        </button>
      </div>
      <p id={statusId} role="status" className="mt-3 min-h-5 text-sm text-ivory-muted">
        {status === "done" ? copy.success : status === "error" ? copy.error : ""}
      </p>
    </form>
  );
}
