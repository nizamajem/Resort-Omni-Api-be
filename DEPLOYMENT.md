# Resort Backend Deployment (GCP VM)

## Prerequisites
- Node.js 18 LTS (e.g. via NodeSource)
- PostgreSQL database reachable from the VM (Cloud SQL or managed instance)
- Populated `.env` file (see `.env.sample`)
- PM2 (optional but recommended) installed globally: `npm i -g pm2`

## Steps
1. **Install dependencies**
   ```sh
   npm ci
   ```
2. **Run database migrations**
   ```sh
   npm run migrate:run
   ```
3. **Start the API**
   ```sh
   npm run start:prod
   ```
   Or with PM2:
   ```sh
   pm2 start npm --name resort-be -- run start:prod
   pm2 save
   ```

## Useful commands
- Revert last migration:
  ```sh
  npm run migrate:revert
  ```
- Sync schema (development only):
  ```sh
  npm run schema:sync
  ```

## Notes
- The compiled application lives in `dist/`. Building from TypeScript sources is not required on the server.
- Ensure `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, and `DB_NAME` are set in the environment.
- Open firewall port (default `4000`) or proxy through Nginx.
