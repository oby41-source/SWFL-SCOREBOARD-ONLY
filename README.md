# SWFL Broadcast Scoreboard

Remote-sync SWFL broadcast overlay for PlayHQ scores.

## Pages

- `/` opens the broadcast control page and chroma preview.
- `/broadcast.html?output=1` opens the clean OBS overlay output.
- `/scores` opens the full scores dashboard.

## Deploy on Render

Use this as a Node Web Service.

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Environment variables:

```text
PLAYHQ_API_KEY=your PlayHQ key
PLAYHQ_ORG_ID=29d0a074-dd7b-4b17-9ff6-42c45e97402c
PLAYHQ_TENANT=afl
```

## Remote control

Open the control page on any computer and the overlay page on the production computer. The control state is shared through `/ctrl`, so round/game/scoreboard changes update everywhere.

## Latest change

The ticker has been removed. The scoreboard now shows an **Other live games** box only when another live game is happening in the same selected round, excluding the selected game.
