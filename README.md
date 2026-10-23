# CloudMedia

Production-ready media platform: Next.js 14 (App Router) + Prisma/PostgreSQL + NextAuth + Vercel Blob + Tailwind + Framer Motion.

## 1. Setup

```bash
npx create-next-app@latest cloudmedia --typescript --tailwind --app --src-dir=false
cd cloudmedia

npm install @prisma/client @auth/prisma-adapter next-auth @vercel/blob bcryptjs framer-motion lucide-react
npm install -D prisma tsx @types/bcryptjs

npx prisma init
```

## 2. Environment (.env.local)

```env
DATABASE_URL="postgresql://..."          # Vercel Postgres or Supabase pooled URL
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32"
BLOB_READ_WRITE_TOKEN="vercel blob token"
```

## 3. Database

```bash
npx prisma db push      # or: npx prisma migrate dev --name init
npx prisma studio       # inspect
```

First admin: register normally, then flip the role:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## 4. Deploy (Vercel)

```bash
vercel link
vercel env pull          # or set envs in dashboard
vercel --prod
```

Create a Vercel Blob store in the dashboard and attach `BLOB_READ_WRITE_TOKEN`. Uploads go straight to Blob from the API route — the serverless filesystem is never used.

## Structure

See `docs/STRUCTURE.md` for the full tree.

## Design system

- Fonts: Inter (UI) + Playfair Display (headings)
- Palette: paper `#FAFAF8`, ink `#111`, hairlines `#E5E5E0`
- Flat borders, no shadows, no glassmorphism
- Icons: lucide-react only
- Motion: subtle whileInView fades, `ease-out-expo`
