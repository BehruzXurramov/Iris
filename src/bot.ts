import "dotenv/config";
import { Bot, Context } from "grammy";
import { getPrompt } from "./prompt.js";
import { GoogleGenAI } from "@google/genai";
import { errorHandler } from "./error-handler.js";

const bot = new Bot(process.env.BOT_TOKEN!);
const ai = new GoogleGenAI({ apiKey: process.env.AI_TOKEN! });

const generate = async (prompt: string) => {
  const reponse = await ai.models.generateContent({
    model: "gemma-4-31b-it",
    contents: prompt,
  });

  return reponse.text;
};

const getInfo = (ctx: Context) => {
  const userText = ctx.message?.text || ctx.message?.caption;
  const replyText =
    ctx.message?.reply_to_message?.text ||
    ctx.message?.reply_to_message?.caption;
  const isReplyToBot = ctx.message?.reply_to_message?.from?.id === ctx.me.id;

  const isPrivate = ctx.chat?.type === "private";

  let contextInfo = {};

  if (isPrivate) {
    contextInfo = {
      chat_type: "private",
      name: ctx.from?.first_name + (ctx.from?.last_name ?? ""),
      username: ctx.from?.username ?? null,
    };
  } else {
    contextInfo = {
      sender: {
        name: ctx.from?.first_name + (ctx.from?.last_name ?? ""),
        username: ctx.from?.username ?? null,
      },
      chat: {
        title: ctx.chat?.title,
        username: ctx.chat?.username ?? null,
        type: ctx.chat?.type,
      },
    };
  }

  return { userText, replyText, contextInfo, isReplyToBot };
};

bot.on("my_chat_member", async (ctx) => {
  try {
    const status = ctx.myChatMember.new_chat_member.status;
    const type = ctx.myChatMember.chat.type;
    const title =
      (ctx.chat.first_name ?? "") +
      (ctx.chat.last_name ?? "") +
      (ctx.chat.title ?? "");
    const username = ctx.chat.username;
    const memberCount = await ctx.api
      .getChatMemberCount(ctx.chat.id)
      .catch(() => undefined);

    if (status === "member" || status === "administrator") {
      if (type === "private") {
        await ctx.reply(
          `👋 Hey! I'm Iris, your AI assistant.

Just type /iris followed by your message and I'll help you out. Example: \`/iris What's the weather like on Mars?\`

You can also reply to any of my messages to keep the conversation going — no command needed.

Type /help to learn more.`,
          { parse_mode: "Markdown" },
        );
      } else if (type === "group" || type === "supergroup") {
        await ctx.reply(`👋 Hey everyone! I'm Iris, an AI assistant.

Use /iris followed by your question and I'll reply. You can also reply to my messages to continue chatting.

Type /help for more details.`);
      }
    }

    const infoText = `New Chat Member!\n\nStatus: ${status}\nType: ${type}\nTitle: ${title}${username ? "\nUsername: @" + username : ""}${memberCount ? "\nMembers count: " + memberCount : ""}\nID: ${ctx.chat.id}`;

    await ctx.api.sendMessage(process.env.ADMIN_ID ?? 5751130518, infoText);
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.command("iris", async (ctx) => {
  try {
    const promptInfo = getInfo(ctx);

    if (promptInfo.userText?.length! < 6 && !promptInfo.replyText) {
      return ctx.reply("Not enough context to reply!", {
        reply_parameters: { message_id: ctx.message?.message_id! },
      });
    }

    const prompt = getPrompt(promptInfo);

    const response = await generate(prompt);

    await ctx.reply(response!, {
      reply_parameters: { message_id: ctx.message?.message_id! },
      parse_mode: "Markdown",
    });
  } catch (error: any) {
    errorHandler(ctx, error);
  }
});

bot.command("help", async (ctx) => {
  try {
    await ctx.reply(
      `👋 Hey! I'm Iris, your AI assistant.

Here's how to chat with me:

In private chat: Just use /iris followed by your message. Example: \`/iris What is the capital of France?\`

In groups: Same thing — type /iris and your question. Example: \`/iris Explain recursion in simple words\`

Reply to continue: You can reply directly to any of my messages and I'll respond — no need to type /iris again.

Reply to others: You can also reply to someone else's message with /iris and I'll use their message as context.

🌐 I reply in whatever language you write in.`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.on("message", async (ctx) => {
  try {
    const message = ctx.message;

    if (message.reply_to_message?.from?.id === ctx.me.id) {
      const promptInfo = getInfo(ctx);
      const prompt = getPrompt(promptInfo);
      const response = await generate(prompt);

      await ctx.reply(response!, {
        reply_parameters: { message_id: ctx.message.message_id },
        parse_mode: "Markdown",
      });
    }
  } catch (error) {
    errorHandler(ctx, error);
  }
});

bot.start();
