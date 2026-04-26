import type { Context } from "grammy";

export async function errorHandler(ctx: Context, error: any) {
  try {
    if (error.status === 429) {
      await ctx.reply("Too many request. Please try again later!", {
        reply_parameters: { message_id: ctx.message?.message_id! },
      });
    } else {
      await ctx.reply("Something went wrong. Please try again later!", {
        reply_parameters: { message_id: ctx.message?.message_id! },
      });

      await ctx.api.sendMessage(
        process.env.ADMIN_ID ?? 5751130518,
        `ERROR. \nStatus: ${error.status || error.response?.status || "none"}\nName: ${error.name || "none"}\nMessage: ${error.message}`,
      );

      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}
