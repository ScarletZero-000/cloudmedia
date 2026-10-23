cloudmedia/
├── prisma/
│   └── schema.prisma
├── app/
│   ├── layout.tsx                  # root: fonts + globals
│   ├── globals.css
│   ├── (public)/
│   │   ├── layout.tsx              # SessionProvider + Header/Footer
│   │   ├── feed/
│   │   │   └── page.tsx            # main feed (SSR first page)
│   │   ├── upload/
│   │   │   └── page.tsx            # upload UI
│   │   ├── album/
│   │   │   └── [id]/page.tsx       # album detail
│   │   └── media/
│   │       └── [id]/page.tsx       # media detail + comments
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── admin/
│   │   ├── page.tsx                # dashboard (stats)
│   │   ├── users/page.tsx          # user management
│   │   ├── posts/page.tsx          # post moderation
│   │   └── analytics/page.tsx      # visitor analytics
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── upload/route.ts         # POST — blob upload + Post row
│       ├── posts/route.ts          # GET feed (cursor pagination)
│       ├── posts/[id]/route.ts     # PATCH / DELETE (owner|admin)
│       ├── comments/route.ts       # GET / POST
│       ├── albums/route.ts         # GET / POST
│       └── admin/
│           ├── users/route.ts      # GET / PATCH(role) / DELETE
│           └── stats/route.ts      # GET dashboard aggregates
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── feed/
│   │   ├── Feed.tsx                # infinite scroll client
│   │   └── MediaCard.tsx
│   ├── media/
│   │   └── UploadForm.tsx
│   ├── editor/
│   │   └── RichText.tsx            # Notion-like block renderer
│   └── admin/
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── types/
│   └── index.ts
├── tailwind.config.ts
├── package.json
└── README.md
