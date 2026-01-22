# Living Dex Tracker

A web app to track completion of a living Pokédex.

## Developing

1. Clone the repository
2. Install the dependencies with `npm install`
3. Ensure that Docker is running
4. An example `.env` file is provided in the repository. You will need to copy `.env.example` to `.env` and fill in the values with your own credentials. For local development with Supabase running in Docker, you can use the following values:

   - The `PUBLIC_SUPABASE_URL` will be `"http://127.0.0.1:54321"`
   - The `PUBLIC_SUPABASE_ANON_KEY` will be the 'Publishable' authentication key displayed when you run Supabase in the terminal
   - The `SUPABASE_SERVICE_ROLE_KEY` will be the 'Secret' authentication key displayed when you run Supabase in the terminal

5. Start local Supabase and a development server with `npm run dev:supabase`
6. The Pokédex data is automatically seeded via database migrations when Supabase starts
7. Create an account using the sign-up form and access the email it sends in [MailPit](http://127.0.0.1:54324/) to verify your email address.
   N.B. All local emails are captured by MailPit when running Supabase in Docker.
8. You can now use [the app](http://localhost:5173/).

## Reference Data Updates

The seed data lives in `supabase/migrations/20260118001000_seed_reference_data.sql`. Update that migration directly when new data is added.

## Building

To create a production version:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Sprites

The app uses WebP sprites from `static/sprites-small`. During builds we generate this folder from the
full-resolution PNGs in `static/sprites`:

```bash
npm run sprites:build
```

If you want to serve sprites locally, set `PUBLIC_USE_LOCAL_POKEMON_SPRITE_FOLDER="true"` in `.env`.
Otherwise the app defaults to GitHub raw for `static/sprites-small`.

## Hosting

The app is hosted on [Netlify](https://www.netlify.com/) at [pokedex.jcreek.co.uk](https://pokedex.jcreek.co.uk/).

The Pokédex data is stored in a [Supabase](https://supabase.com/) database.

User authentication is handled by [Supabase Auth](https://supabase.com/auth).

## Dependencies

The living dex tracker's sprite collection is derived from [PokéAPI Sprites](https://github.com/PokeAPI/sprites)
and converted to smaller WebP files in `static/sprites-small`. PokéAPI sprites are licensed under
[the Creative Commons CC0 1.0 Universal license](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt).
