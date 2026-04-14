# How to Get Your FREE Groq API Key 🔑

Follow these simple steps to get your Groq API key:

## Step-by-Step Guide

### 1. Visit Groq Console
Go to: **https://console.groq.com**

### 2. Sign Up / Log In
- Click **"Sign Up"** if you're new
- Or **"Log In"** if you have an account
- You can sign up with:
  - Email
  - Google account
  - GitHub account

### 3. Navigate to API Keys
Once logged in:
- Look for **"API Keys"** in the left sidebar
- Or go directly to: https://console.groq.com/keys

### 4. Create New API Key
- Click **"Create API Key"** button
- Give it a name (e.g., "SentiBot")
- Click **"Create"**

### 5. Copy Your API Key
- Your API key will look like: `gsk_xxxxxxxxxxxxxxxxxxxxxxxx`
- **IMPORTANT:** Copy it immediately - you won't be able to see it again!
- It starts with `gsk_`

### 6. Add to Your .env File

Create a `.env` file in your project folder:

```bash
GROQ_API_KEY=gsk_your_copied_key_here
```

Replace `gsk_your_copied_key_here` with your actual key.

### Quick Command:
```bash
copy .env.example .env
```
Then edit `.env` and paste your key.

## Verify It Works

Run SentiBot:
```bash
python sentibot.py
```

You should see:
```
============================================================
                        SENTIBOT 2.0
                 Sentiment Analysis Chatbot
                Powered by Groq + Llama 3.3
============================================================

✓ SentiBot initialized successfully!
```

## Important Notes ⚠️

1. **Keep it Secret:** Never share your API key publicly
2. **Free Tier:** Groq offers generous free usage
3. **Rate Limits:** Free tier has limits but they're quite high
4. **No Credit Card:** No credit card required for free tier!

## Troubleshooting

### "Invalid API Key" Error
- Make sure you copied the entire key (starts with `gsk_`)
- Check for extra spaces
- Ensure `.env` file is in the correct directory

### "Rate Limit" Error  
- Wait a few moments
- Free tier resets regularly
- Consider creating a new key if needed

## Need Help?

- Groq Documentation: https://console.groq.com/docs
- Groq Discord: Check their website for community support

---

**Once you have your key set up, you're ready to use SentiBot! 🚀**
