# Living Dex Tracker

A web app to track completion of a living Pokédex.

## Developing

Cloned the repository you can install the dependencies with `npm install`, and start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

An example `.env` file is provided in the repository. You will need to copy `.env.example` to `.env` and fill in the values with your own credentials.

Once you have done this, you can seed the Pokédex data using the /api/seed endpoint. You will need to comment out the `return;` at the beginning of the `GET` function in `/src/routes/api/seed.ts` to do this. Make sure you remember to uncomment it afterwards.

## Building

To create a production version:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Hosting

The app is hosted on [Netlify](https://www.netlify.com/) at [pokedex.jcreek.co.uk](https://pokedex.jcreek.co.uk/).

The Pokédex data is stored in a [MongoDB](https://www.mongodb.com/) database hosted on [MongoDB Cloud](https://cloud.mongodb.com/).

User authentication is handled by [Supabase Auth](https://supabase.com/auth).

VITE_SUPABASE_PASSWORD="1muR3DwZgy2LNazT" LivingDexTracker

mongodb
livingdextracker
0lNlj4wbTFH2UZcy

## Dependencies

The living dex tracker's sprite collection is taken from [pokesprite](https://github.com/msikma/pokesprite), which is licensed under [the MIT license](https://github.com/msikma/pokesprite/blob/master/LICENSE).
