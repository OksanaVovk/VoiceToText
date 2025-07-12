# 🎤 Voice to Text Web App

This is a full-stack Next.js application that allows users to upload audio files, transcribe them using AssemblyAI, and view the history of transcriptions. Users must be authenticated via Clerk and make a one-time payment via Stripe to unlock transcription access. Audio files are stored securely on AWS S3.

---

## 🚀 Features

- User authentication via Clerk
- Upload and transcribe audio files
- Store files on AWS S3
- Transcription powered by AssemblyAI
- Payment integration using Stripe
- Transcription history panel per user
- File size validation and error handling

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Authentication:** Clerk
- **Payments:** Stripe Checkout
- **Storage:** Amazon S3
- **Transcription:** AssemblyAI API
- **Backend:** API routes inside Next.js
- **Database:** PostgreSQL (Prisma ORM)

---

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/OksanaVovk/VoiceToText.git
cd VoiceToText
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a .env file and copy the following template:

```bash
# PostgreSQL Database
DATABASE_URL=

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_FRONTEND_API=

# AssemblyAI (Transcription)
ASSEMBLYAI_API_KEY=

# Stripe (Payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS S3 (Storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

```

4. **Run the App**

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

5. **Open your browser at http://localhost:3000**

🧪 Notes
Make sure your AWS S3 bucket allows public read access for audio files or use signed URLs.

Stripe webhooks must be forwarded locally using the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

✅ Features
🔐 Secure authentication via Clerk
☁️ Upload audio files to S3
🧠 Transcribe audio using AssemblyAI
💳 Unlock access with Stripe payment
📜 View transcription history
