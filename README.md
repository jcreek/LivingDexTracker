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

The seed data lives in `supabase/migrations/20260118001000_seed_reference_data.sql`. Update that migration directly when new data is added. You can access a local copy of [Supabase](http://localhost:54323/) to check it.

## Building

To create a production version:

```bash
npm run build
```

## Testing

The test suite is split by responsibility so a failure points to the correct layer:

- `tests/unit` contains fast, isolated tests for utilities, repositories, and services.
- `tests/data` validates the tracked Pokémon, game, region, dex, and sprite reference files.
- `tests/integration` checks the migrated Supabase schema, views, constraints, RLS, and repositories.
- `tests/bdd/features` is the executable Gherkin specification for user-visible behaviour. Step
  definitions and browser fixtures live beside it under `tests/bdd`.
- `tests/build` verifies generated service-worker and manifest artifacts after each supported build.

Run the offline suites while developing:

```bash
npm run test:fast
npm run test:coverage
```

Database and BDD tests require Docker and the local Supabase stack. The wrappers read local keys from
`supabase status`; no credentials are written to disk or committed:

```bash
npm run supabase:start
npm run supabase:reset
npm run test:integration
npm run test:bdd
```

`npm test` runs the complete CI-equivalent sequence and fails with setup instructions when Supabase is
not available. Individual layers are available as `test:unit`, `test:data`, `test:integration`,
`test:build`, and `test:bdd`.

Gherkin describes outcomes in domain language. Keep selectors, API calls, test-user provisioning, and
provider mocks in step definitions or support fixtures. `@product-review` marks a rule that should be
reviewed with product stakeholders, but does not skip it. Missing or ambiguous steps fail generation.

Google Drive and Dropbox scenarios use a local provider server and private endpoint overrides. They do
not contact real provider accounts. Chromium is the only configured browser project. Playwright traces
and screenshots are retained on failure under `test-results`.

The current National Dex maximum is deliberately asserted as 1025. When adding a new generation,
update that expectation together with Pokémon data, the corresponding game/dex files, database seed,
and sprites. Data tests print the exact conflicting identities or broken references.

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
