# Film Club Website

## Developing
### Setup Prisma

Add a `.env` file in your root directory with a `DATABASE_URL` variable inside, updating `<password>` to your database password.
```
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/film_club_discord_bot?schema=public"
```

Then run the following commands
```bash
npm i
npx prisma migrate deploy # Run current migrations
npx prisma generate # Setup Prisma client
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
DATABASE_URL="postgres://postgres:<password>@localhost:15432/film_club_discord_bot?schema=public"
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
