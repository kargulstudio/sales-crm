"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/_ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/_ui/dialog";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import Tag from "@/components/_ui/tag";
import { PENDING_INVITES, TEAM_ROLES, type Invite } from "@/data/workspace";
import { useCompaniesStore } from "@/stores/companies-store";
import UserPlusIcon from "@/public/assets/images/companies/sidebar/user-plus.svg";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteDialog() {
  const open = useCompaniesStore((state) => state.appDialog === "invite");
  const setAppDialog = useCompaniesStore((state) => state.setAppDialog);
  const [invites, setInvites] = useState<Invite[]>(PENDING_INVITES);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(TEAM_ROLES[2]);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const addresses = email
      .split(/[\s,;]+/)
      .map((address) => address.trim().toLowerCase())
      .filter(Boolean);

    if (addresses.length === 0) {
      setError("Enter at least one email address.");
      return;
    }
    const invalid = addresses.find((address) => !EMAIL_PATTERN.test(address));
    if (invalid) {
      setError(`${invalid} is not a valid email address.`);
      return;
    }

    const fresh = addresses.filter(
      (address) => !invites.some((invite) => invite.email === address),
    );
    setInvites((current) => [
      ...fresh.map((address) => ({ email: address, role, sent: "Just now" })),
      ...current,
    ]);
    setEmail("");
    setError(null);
  }

  function revoke(address: string) {
    setInvites((current) =>
      current.filter((invite) => invite.email !== address),
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => setAppDialog(next ? "invite" : null)}
    >
      <DialogContent
        className="max-w-[520px]"
        onCloseAutoFocus={() => {
          setEmail("");
          setError(null);
        }}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Invite teammates</DialogTitle>
            <DialogDescription>
              They get an email to join your Sales CRM workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6 py-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
            <Field
              label="Email addresses"
              htmlFor="invite-email"
              hint="Separate several addresses with commas."
              error={error ?? undefined}
            >
              <Input
                id="invite-email"
                type="text"
                inputMode="email"
                autoComplete="off"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@company.com"
                aria-invalid={error ? true : undefined}
                aria-describedby={
                  error ? "invite-email-error" : "invite-email-hint"
                }
                className="aria-invalid:border-danger"
                autoFocus
              />
            </Field>
            <Field label="Role" htmlFor="invite-role">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_ROLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-3 px-6 py-5">
            <span className="eyebrow-style text-soft block">
              Pending invites
            </span>
            {invites.length > 0 ? (
              <ul className="divide-line-strong border-line-strong flex flex-col divide-y rounded-lg border">
                {invites.map((invite) => (
                  <li
                    key={invite.email}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <span className="flex min-w-0 flex-col gap-1.5">
                      <span className="lead-style block truncate">
                        {invite.email}
                      </span>
                      <span className="caption-style text-subtle block">
                        {invite.sent}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Tag tone="neutral" size="sm" className="caption-style">
                        {invite.role}
                      </Tag>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revoke(invite.email)}
                        aria-label={`Revoke invite for ${invite.email}`}
                      >
                        Revoke
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="caption-style text-subtle block">
                No pending invites.
              </span>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="subtle" size="sm">
                Done
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" type="submit">
              <UserPlusIcon aria-hidden className="size-3" />
              Send invites
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
