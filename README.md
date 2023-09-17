# Film Club Website

## Developing
### Install Postgresql
1. https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Ensure you setup a user account with superuser privileges during this process
3. Make sure PostgreSQL bin directory is added to the path
4. Open terminal and type `psql -U <username>` and enter your password

```sql
CREATE DATABASE film_club_discord_bot;
GRANT ALL PRIVILEGES ON DATABASE film_club_discord_bot TO <username>;
```
### Setup Prisma

Add a `.env` file in your root directory with a `DATABASE_URL` variable inside, updating `<password>` to your database password and `<username>` to your username (e.g. postgres).
```
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/film_club_discord_bot?schema=public"
```

Then run the following commands
```bash
npm i
npx prisma migrate deploy # Run current migrations
npx prisma generate # Setup Prisma client
```

### Create env
Add an `.env` file to your root directory of the project, it should contain the following variables.
Ask Ted or Alex for passwords.

```
DATABASE_URL="postgres://<username>:<password>@localhost:15432/film_club_discord_bot?schema=public"
DISCORD_WEBHOOK_URL__FILM_CLUB="https://discord.com/api/webhooks/..."
OMDB_API_KEY=<api key>
FILM_CLUB_PASSWORD=<club password>
FILM_CLUB_USERNAMES=alex,hong,egle,ted
TMDB_ACCESS_KEY=<TMDB api key>
```

### Run Development Environment
Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Creating New Models
#### Local
When you have modified the schema and want to execute your changes run `npm prisma migrate dev` to create migration files (This will also deploy them).

#### Fly.io
If you want to push your changes to Fly.io, you will need to migrate the Fly.io database.
Change your `DATABASE_URL` in your `.env` file to the fly.io connection string (If you don't have the password ask Ted).
```
DATABASE_URL="postgres://<username>:<password>@localhost:15432/film_club_discord_bot?schema=public"
```

Now you will need to setup a connection to the Fly.io database, this will allow you to connect as if it was a local database.
```bash
fly proxy 15432:5432 -a pg-film-club-discord-bot
```

In a seperate terminal run `npx prisma migrate deploy`, after it is done you can close the proxy connection and you are done.

### Discord webhook
To enable posting scores to discord, you need to set the environment variable
`DISCORD_WEBHOOK_URL__FILM_CLUB` to a valid discord webhook URL for the film club channel.

You can access existing webhooks and generate new ones through the discord app, go to:
`your discord server -> server settings -> integrations -> webhooks`
Click on a `webhook -> copy webhook url` to copy it's URL

To set the environment variable (env var) when running locally, you can run:
`DISCORD_WEBHOOK_URL__FILM_CLUB="https://discord.com/api/webhooks/<rest of it>" npm run dev`
If you're sick of that you could run:
`export DISCORD_WEBHOOK_URL__FILM_CLUB="https://discord.com/api/webhooks/<rest of it>"`
and then every time you run `npm run dev` in that terminal session, the env var will be set.

If you're on Windows, you're on your own. Sorry.


## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
