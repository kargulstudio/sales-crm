import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const id = await getAuthUserId(ctx);
    if (!id) return null;
    const user = await ctx.db.get(id);
    if (!user) return null;
    return {
      id: user._id as string,
      name: user.name || user.email || "Unknown",
      email: user.email ?? "",
    };
  },
});
