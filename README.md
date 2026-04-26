# 🤖 Iris — Telegram AI Assistant Bot           

A lightweight Telegram bot powered by Google's **Gemma 4** model. Iris acts as a friendly, witty AI assistant that works in both private chats and groups.

**🟢 Live & Working:** [@AI_IrisBot](https://t.me/AI_IrisBot)

## Features

- `/iris <message>` — Ask anything
- `/help` — Usage guide
- **Reply to continue** — Reply to Iris's messages to keep the conversation going (no command needed)
- **Context-aware** — Reply to someone else's message with `/iris` and it uses their message as context
- **Multilingual** — Responds in whatever language you write in
- Works in **private chats** and **groups**

## Tech Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Bot Framework:** [grammY](https://grammy.dev)
- **AI Model:** Google Gemma 4 31B via `@google/genai`

## Setup        
            
```bash
git clone https://github.com/BehruzXurramov/Iris.git
cd Iris
npm install
```

Create a `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token
AI_TOKEN=your_google_ai_api_key
ADMIN_ID=your_telegram_user_id
```

```bash
npm run build   # Compile TypeScript
npm start       # Run the bot
```
