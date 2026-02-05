# Zero-Cost Deployment Guide (No Credit Card)

To make your project "Job Ready" with a live link that never sleeps, follow this stack. This setup requires **no credit card** and uses a "Keep-Alive" trick to avoid downtime.

## 1. The Stack
| Layer | Service | Why? |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | 100% Free, No CC, Zero Downtime, Auto-deploys from GitHub. |
| **Backend** | [Koyeb](https://www.koyeb.com) | Hobby Plan usually requires No CC. It supports Docker (needed for your Django project). |
| **Database** | [Supabase](https://supabase.com) | Free PostgreSQL. No CC. Fast and reliable. |
| **Keep-Alive** | [Cron-job.org](https://cron-job.org) | **The Secret**: Pings your backend every 5 minutes to prevent it from sleeping. |

## 2. Deployment Steps

### Step A: Database (Supabase)
1. Sign up for **Supabase** using your GitHub account.
2. Create a new Project.
3. Copy the **PostgreSQL Connection String** from Project Settings -> Database.

### Step B: Backend (Koyeb)
1.  **Sign up**: Create an account on [Koyeb](https://app.koyeb.com/signup).
2.  **Create Service**: Click **Create Service** and select **GitHub**.
3.  **Repository**: Select your `PetCarePlus-Django-React` repository.
4.  **Backend Configuration**:
    *   **Work Directory**: `backend` (Important!)
    *   **Build Type**: Select **Docker**. It will use the `Dockerfile` I prepared.
    *   **Exposed Port**: `8000`.
5.  **Environment Variables**: Add these in the "Advanced" section:
    *   `SECRET_KEY`: (Generate a random string)
    *   `DEBUG`: `False`
    *   `DJANGO_ENV`: `production`
    *   `ALLOWED_HOSTS`: `petcareplus-api.koyeb.app,localhost` (Replace with your actual Koyeb app domain)
    *   `SQL_DATABASE`: `postgres`
    *   `SQL_USER`: `postgres.wryusgoztbthruxygkde`
    *   `SQL_PASSWORD`: `Shahin567&*-`
    *   `SQL_HOST`: `aws-1-ap-south-1.pooler.supabase.com`
    *   `SQL_PORT`: `6543`
    *   `SQL_ENGINE`: `django.db.backends.postgresql`
    *   `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app` (Add this later once you have Vercel link)
    *   `CSRF_TRUSTED_ORIGINS`: `https://your-frontend.vercel.app`
6.  **Deploy**: Click **Deploy**. Koyeb will build your Docker image and start the server.

### Step C: Frontend (Vercel)
1. Sign up for **Vercel**.
2. Import your GitHub repo.
3. Select the `frontend` folder as the root.
4. Set **Build Command**: `npm run build`.
5. Set **Environment Variables**:
   - `VITE_API_URL`: Your Koyeb backend URL.
6. Deploy.

### Step D: The "No Downtime" Hack (Cron-job.org)
Free tiers like Koyeb and Supabase "sleep" or "pause" after inactivity. To prevent this:
1. Sign up for [Cron-job.org](https://cron-job.org) (Free, No CC).
2. Create a new Cronjob.
3. **URL**: Your Koyeb backend health check or home URL (e.g., `https://your-app.koyeb.app/api/admin-panel/analytics/`).
4. **Execution Schedule**: Every 5 minutes.
5. This keeps your server "warm" so recruiters never experience a slow first load.

---

## 3. Why this is Resume Ready?
- **Live Links**: You get `petcareplus-ui.vercel.app` and `petcareplus-api.koyeb.app`.
- **Fast Performance**: Vercel's Edge network makes the UI feel instant.
- **Zero Cost**: You can keep this running forever as long as you stay within the free limits.
