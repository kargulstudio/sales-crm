import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Comma-separated list such as "hypedrive.in,kargul.studio"; empty allows any email.
function emailAllowed(email: string) {
  const allowed = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(email.split("@")[1] ?? "");
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "")
          .trim()
          .toLowerCase();
        const name = String(params.name ?? "").trim();
        if (params.flow === "signUp" && !emailAllowed(email)) {
          throw new ConvexError("This email domain is not allowed to sign up");
        }
        const profile: { email: string; name?: string } = { email };
        if (name) profile.name = name;
        return profile as { email: string };
      },
    }),
  ],
});

export type Viewer = { id: Id<"users">; name: string };

export async function requireViewer(ctx: QueryCtx): Promise<Viewer> {
  const id = await getAuthUserId(ctx);
  if (!id) throw new ConvexError("Not signed in");
  const user = await ctx.db.get(id);
  if (!user) throw new ConvexError("Not signed in");
  return { id, name: user.name || user.email || "Unknown" };
}
