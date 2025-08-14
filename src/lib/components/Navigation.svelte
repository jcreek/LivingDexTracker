<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import { page } from '$app/stores';

	export let user: User | undefined;
</script>

<nav class="navbar bg-primary text-primary-content shadow-lg" data-testid="main-navigation">
	<div class="navbar-start">
		<div class="dropdown">
			<button
				class="btn btn-ghost lg:hidden"
				data-testid="mobile-menu-button"
				aria-label="Open mobile menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</button>
			<ul
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 text-base-content rounded-box w-52"
				data-testid="mobile-menu"
			>
				<li>
					<a href="/" class:active={$page.url.pathname === '/'} data-testid="nav-home-mobile"
						>Home</a
					>
				</li>
				{#if user}
					<li>
						<a
							href="/pokedexes"
							class:active={$page.url.pathname === '/pokedexes'}
							data-testid="nav-pokedexes-mobile">Pokédexes</a
						>
					</li>
					<li>
						<a
							href="/mydex"
							class:active={$page.url.pathname === '/mydex'}
							data-testid="nav-mydex-mobile">MyDex</a
						>
					</li>
					<li>
						<a
							href="/profile"
							class:active={$page.url.pathname === '/profile'}
							data-testid="nav-profile-mobile">Profile</a
						>
					</li>
				{/if}
				<li>
					<a
						href="/about"
						class:active={$page.url.pathname === '/about'}
						data-testid="nav-about-mobile">About</a
					>
				</li>
			</ul>
		</div>
		<a href="/" class="btn btn-ghost text-xl" data-testid="brand-logo">Living Dex Tracker</a>
	</div>

	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1" data-testid="desktop-menu">
			<li>
				<a href="/" class:active={$page.url.pathname === '/'} data-testid="nav-home-desktop">Home</a
				>
			</li>
			{#if user}
				<li>
					<a
						href="/pokedexes"
						class:active={$page.url.pathname === '/pokedexes'}
						data-testid="nav-pokedexes-desktop">Pokédexes</a
					>
				</li>
				<li>
					<a
						href="/mydex"
						class:active={$page.url.pathname === '/mydex'}
						data-testid="nav-mydex-desktop">MyDex</a
					>
				</li>
				<li>
					<a
						href="/profile"
						class:active={$page.url.pathname === '/profile'}
						data-testid="nav-profile-desktop">Profile</a
					>
				</li>
			{/if}
			<li>
				<a
					href="/about"
					class:active={$page.url.pathname === '/about'}
					data-testid="nav-about-desktop">About</a
				>
			</li>
		</ul>
	</div>

	<div class="navbar-end">
		{#if user}
			<form method="POST" action="/auth/signout" data-testid="signout-form">
				<button type="submit" class="btn btn-ghost" data-testid="signout-button">Sign Out</button>
			</form>
		{:else}
			<a href="/signin" class="btn btn-ghost" data-testid="signin-link">Sign In</a>
		{/if}
	</div>
</nav>

<style>
	.active {
		background-color: color-mix(in srgb, oklch(var(--p)) 80%, black);
	}
</style>
