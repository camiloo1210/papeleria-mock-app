# Fiado Canal Digital - Papelería El Estudiante

## Deployment to Vercel

### Prerequisites
1. Vercel CLI installed: `npm i -g vercel`
2. Or use Vercel dashboard

### Deploy

```bash
# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

For Vercel, set these in the dashboard or via CLI:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_USE_MOCK` | `true` | Mock mode for demo |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Optional if using mock |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Optional if using mock |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Optional if using mock |

### Project Structure

```
fiado-canal-digital/
├── apps/
│   └── web/              # Next.js web app
├── packages/
│   └── core/             # Shared packages
├── vercel.json           # Vercel configuration
└── turbo.json            # Turborepo configuration
```

### Important Notes

- This is a **mock/demo** application
- When `NEXT_PUBLIC_USE_MOCK=true`, authentication and database are bypassed
- The app redirects all `/auth/*` routes to `/protected` in mock mode
- For production, set `NEXT_PUBLIC_USE_MOCK=false` and configure Supabase