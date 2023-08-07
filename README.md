# Film Club Website

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

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
