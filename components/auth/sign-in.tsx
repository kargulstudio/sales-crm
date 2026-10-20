"use client";

import { useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import Button from "@/components/_ui/button";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import Logo from "@/public/assets/images/_common/logo.svg";

type Flow = "signIn" | "signUp";

const MIN_PASSWORD = 8;

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<Flow>("signIn");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (flow === "signUp" && password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for the password.`);
      return;
    }
    form.set("flow", flow);
    setPending(true);
    setError(null);
    try {
      await signIn("password", form);
    } catch (caught) {
      const message =
        caught instanceof ConvexError ? String(caught.data) : undefined;
      setError(
        message ??
          (flow === "signIn"
            ? "That email and password don't match an account."
            : "Couldn't create the account. The email may already be registered."),
      );
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="bg-card shadow-card flex w-full max-w-90 flex-col rounded-xl">
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-2 text-center">
          <Logo aria-hidden className="size-10 overflow-visible" />
          <h1>Sales CRM</h1>
          <p className="caption-style text-fg-secondary leading-snug">
            {flow === "signIn"
              ? "Sign in to see your team's pipeline."
              : "Create an account to join your team's pipeline."}
          </p>
        </div>

        <Tabs
          value={flow}
          onValueChange={(value) => {
            setFlow(value as Flow);
            setError(null);
          }}
        >
          <TabsList className="justify-center px-6 shadow-[inset_0_-1px_0_var(--border)]">
            <TabsTrigger value="signIn">Sign in</TabsTrigger>
            <TabsTrigger value="signUp">Create account</TabsTrigger>
          </TabsList>
        </Tabs>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-6 pt-5 pb-6"
        >
          {flow === "signUp" && (
            <Field label="Full name" htmlFor="auth-name">
              <Input
                id="auth-name"
                name="name"
                autoComplete="name"
                required
                placeholder="Jensen Ackles"
              />
            </Field>
          )}
          <Field label="Work email" htmlFor="auth-email">
            <Input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              required
              placeholder="you@company.com"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="auth-password"
            hint={
              flow === "signUp"
                ? `At least ${MIN_PASSWORD} characters.`
                : undefined
            }
          >
            <Input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={
                flow === "signIn" ? "current-password" : "new-password"
              }
              required
            />
          </Field>
          {error && (
            <p role="alert" className="caption-style text-danger leading-snug">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={pending}
            className="mt-1 w-full"
          >
            {flow === "signIn" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </div>
    </main>
  );
}
