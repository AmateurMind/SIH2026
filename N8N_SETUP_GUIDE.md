# 🤖 How to Start n8n & Telegram Integration

Since you are using the free version of ngrok, your URL changes every time you restart. Follow these steps to get everything running in 2 minutes.

## 1️⃣ Start Docker Desktop
- Open **Docker Desktop** on your laptop.
- Wait until the bottom left corner says **"Engine running"** (green).

## 2️⃣ Start ngrok (The Tunnel)
- Open a terminal (Command Prompt or PowerShell).
- Run this command:
  ```bash
  ngrok http 5678
  ```
- **Copy the Forwarding URL**. It will look like: `https://abcd-1234.ngrok-free.app`

## 3️⃣ Start n8n (The Automation)
- Open a **NEW** terminal.
- Paste this command, but **REPLACE** the URL at the end with your new ngrok URL from Step 2:

  ```powershell
  docker run -it --rm --name n8n -p 5678:5678 -e WEBHOOK_URL=https://inadvertent-sherrie-responsively.ngrok-free.dev -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
  ```
  *(Example: `... -e WEBHOOK_URL=https://abcd-1234.ngrok-free.app ...`)*

## 4️⃣ Start Your Backend
- Open a **third** terminal.
- Go to your backend folder and start the server:
  ```bash
  cd backend
  npm run dev
  ```

## 5️⃣ Verify
- Go to [http://localhost:5678](http://localhost:5678)
- Open your Telegram workflow.
- Make sure it is set to **Active** (Green toggle).
- Send a message to your Telegram bot to test!
