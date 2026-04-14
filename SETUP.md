# Quick Setup Guide 🚀

Get SentiBot running in 3 simple steps!

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 2: Get Your Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy your API key

## Step 3: Configure Environment

Create a `.env` file:

```bash
copy .env.example .env
```

Open `.env` and add your API key:

```
GROQ_API_KEY=gsk_your_actual_api_key_here
```

## Run SentiBot! 🎉

```bash
python sentibot.py
```

## Quick Commands

- `/help` - Show help
- `/clear` - Clear conversation history
- `/quit` - Exit chatbot

---

**That's it! Start chatting and analyzing sentiments! 💬**

For detailed documentation, see [README.md](README.md)
