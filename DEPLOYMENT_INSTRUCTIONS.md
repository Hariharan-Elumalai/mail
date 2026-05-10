Deployment steps for https://github.com/Hariharan-Elumalai/mail

1. Clone the repo (already done here):

   git clone https://github.com/Hariharan-Elumalai/mail.git
   cd mail

2. The following changes were applied locally:
   - `server/index.js` now exports the Express `app` and only listens when run directly.
   - `server/api/index.js` added: a Vercel serverless wrapper.
   - `vercel.json` added: Vercel build and route configuration.

3. Install dependencies locally:

   npm run install-all

4. Run in development:

   npm run dev

5. To prepare for Vercel deployment:

   - Build client: `npm run build`
   - Commit and push these changes to a new GitHub repository (create the repo on GitHub or use `gh`):

     git add .
     git commit -m "Prepare for Vercel: export app, add serverless wrapper, vercel.json"
     git remote add origin <YOUR_NEW_REPO_URL>
     git push -u origin main

6. On Vercel:

   - Create a new project from the Git repository.
   - Add Environment Variables (example): `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, SMTP settings for nodemailer.
   - Vercel will build the client (`@vercel/static-build`) and deploy serverless functions from `server/api`.

Notes:
- Serverless considerations: long-lived DB connections should use connection caching patterns suitable for serverless functions. The current `connectDB()` may open a connection on import; consider refactoring to lazy/connect-per-invocation with caching.

If you want, I can commit these local changes for you and/or push to a new remote if you provide the remote URL or give me access (gh CLI already authenticated).