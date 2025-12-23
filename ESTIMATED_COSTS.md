# 💰 Estimated Monthly Cost (1,000 Students)

Here is the breakdown of costs in **Indian Rupees (₹)**.

| Component | Budget / MVP Option | Production Option |
| :--- | :--- | :--- |
| **Hosting (Backend)** | **₹510** (DigitalOcean Droplet) | **₹2,125** (Render/Railway) |
| **Database (MongoDB)** | **₹0 - ₹425** (Shared/Serverless) | **₹4,850** (Atlas M10 Cluster) |
| **Authentication (Clerk)** | **₹0** (Free Tier - up to 10k users) | **₹0** (Free Tier) |
| **AI (Gemini API)** | **₹0 - ₹425** (Gemini 1.5 Flash) | **₹1,000+** (Gemini Pro / Heavy Usage) |
| **Storage (Files)** | **₹0** (Cloudinary Free Tier) | **₹500** (AWS S3 / Paid Cloudinary) |
| **Total Monthly** | **~ ₹1,000 - ₹1,500** | **~ ₹8,500 - ₹9,000** |

---

### 📉 Why is the Budget Option so cheap?
The **Budget Option** uses a "Virtual Private Server" (VPS) from providers like DigitalOcean.
-   **Cost:** Only **₹510 ($6)** per month.
-   **Benefit:** You get a full computer in the cloud. You can run your **Backend**, **n8n**, **Cron Jobs**, and even a small **Database** all on this single ₹510 server.
-   **Trade-off:** You have to set it up yourself (takes about 30 mins) instead of it being automatic.

### � Why is the Production Option expensive?
The **Production Option** uses "Managed Services" like Render or Heroku.
-   **Cost:** You pay a premium for them to manage the server update, security, and scaling for you.
-   **Render vs Cron Jobs:** Render's free tier sleeps after 15 minutes. Using an external "Cron Job ping" trick works for hobby apps, but Render has a **monthly usage limit** (750 hours). If you keep it awake 24/7, you will hit the limit and your site will shut down at the end of the month.
-   **Conclusion:** It is actually cheaper and more reliable to pay **₹510** for a VPS than to try and hack Render's free tier for a production app.
