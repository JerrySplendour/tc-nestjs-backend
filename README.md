# TC Leadership Academy API

This is a NestJS backend tailored for the Transformation Collective Leadership Academy. 

## 1. Local Setup

### Installation
```bash
yarn install
# or
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=development

# SQLite is used by default locally
DB_TYPE=sqlite
DATABASE_URL=./tc-academy.sqlite

# Auth Secrets
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d

# Cloudflare R2 Settings
S3_REGION=auto
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<YOUR_R2_ACCESS_KEY>
S3_SECRET_ACCESS_KEY=<YOUR_R2_SECRET_KEY>
S3_BUCKET=tc-academy-media
MEDIA_PUBLIC_URL=https://pub-xxxx.r2.dev

# Resend (Emails)
RESEND_API_KEY=re_your_resend_api_key_here
```

### Running Locally
```bash
yarn dev
```

---

## 2. Deploying to Render (Production)

Render uses an ephemeral filesystem, meaning SQLite databases will be erased on restart. **You must use Postgres on Render**. This application is configured to automatically use Postgres if `DB_TYPE=postgres`.

### Render Web Service Setup:
1. **Create a PostgreSQL Database** on Render.
2. **Create a Web Service** (Node.js).
3. **Build Command**: `yarn build` (or `npm run build`)
4. **Start Command**: `node dist/main.js` (or `npm run start`)

### Render Environment Variables
Add the following Environment Variables in your Render Dashboard for the Web Service:

- `NODE_ENV`: `production`
- `DB_TYPE`: `postgres`
- `DATABASE_URL`: *(Select the internal database URL of the Postgres database you created in step 1)*
- `DB_SYNCHRONIZE`: `true` *(set to false later once schema is stable and you use migrations)*
- `PORT`: `4000`
- `JWT_SECRET`: *(A random strong string)*
- `JWT_EXPIRES_IN`: `7d`
- `S3_REGION`: `auto`
- `S3_ENDPOINT`: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- `S3_ACCESS_KEY_ID`: `<YOUR_R2_ACCESS_KEY>`
- `S3_SECRET_ACCESS_KEY`: `<YOUR_R2_SECRET_KEY>`
- `S3_BUCKET`: `<YOUR_R2_BUCKET_NAME>`
- `MEDIA_PUBLIC_URL`: `https://<YOUR_R2_PUBLIC_DOMAIN>`
- `RESEND_API_KEY`: `<YOUR_RESEND_API_KEY>`

*(Note: `ssl: { rejectUnauthorized: false }` is automatically enabled in production by `app.module.ts` to satisfy Render Postgres requirements).*

---

## 3. Cloudflare R2 Storage Setup

To allow the frontend to upload media directly via Presigned URLs, you must configure **CORS** on your Cloudflare R2 bucket.

### Setting up CORS for Cloudflare R2
1. Go to your Cloudflare Dashboard -> **R2**.
2. Select your bucket (`tc-academy-media`).
3. Go to the **Settings** tab.
4. Scroll down to **CORS Policy** and click **Add CORS Policy**.
5. Paste the following JSON:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-frontend-domain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```
*(Make sure to update `AllowedOrigins` with your actual frontend URL).*

### Creating API Tokens
1. In the R2 Dashboard, click **Manage R2 API Tokens** (right sidebar).
2. Click **Create API Token**.
3. Name it "TC Academy Backend".
4. Set Permissions to **Object Read & Write**.
5. Create the token. Use the generated `Access Key ID` and `Secret Access Key` for the environment variables in Render.

---

## 4. Email Sending (Resend)

The backend uses **Resend** for sending broadcast emails and newsletters.

1. Go to [Resend.com](https://resend.com) and create an account.
2. In your dashboard, go to **API Keys** and click **Create API Key**.
3. Name it "TC Academy Backend" and give it full access (or sending access).
4. Copy the generated key and add it to your `.env` and Render Environment Variables as `RESEND_API_KEY`.
5. You also need to verify your sending domain in the Resend dashboard under **Domains** so emails can be sent reliably.
6. **Webhook Configuration (Analytics)**: To track email opens, clicks, and bounces, go to **Webhooks** in the Resend dashboard. Click **Add Webhook** and set the Endpoint URL to your backend's webhook route: `https://tc-nestjs-backend.onrender.com/newsletter/webhooks`. Select the events you want to track (e.g. `email.opened`, `email.clicked`, `email.bounced`) and save.
