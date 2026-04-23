# Project Transfer

Use this file when handing the project to another developer or client.

## Git Repository

- The repository is prepared to be pushed to GitHub without secrets.
- Local-only files such as `.env`, `.env.local`, `.env.client-handoff`, and `.netlify/` are ignored and will not be committed.

## Local Run

1. Clone the repository.
2. Copy `.env.example` to `.env.local`.
3. If the real project secrets are being shared directly, use the local handoff file instead:
   - copy `.env.client-handoff` to `.env.local`
4. Install dependencies:
   - `npm install`
5. Start the app:
   - `npm run dev`

## Required Runtime Services

- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Netlify for the current production deployment flow

## Notes

- `RESEND_API_KEY` is still a placeholder in the current local handoff file.
- Product images are stored in the `product-images` bucket in Supabase Storage.
- The current production deployment path is documented in [NETLIFY_SETUP.md](./NETLIFY_SETUP.md).
- The short deploy handoff is documented in [NETLIFY_HANDOFF.md](./NETLIFY_HANDOFF.md).
