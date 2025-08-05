<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<svelte:head>
	<title>Living Dex Tracker - Track Your Pokémon Collection</title>
</svelte:head>

<div class="hero min-h-[80vh]">
	<div class="hero-content text-center">
		<div class="max-w-2xl">
			<h1 class="text-5xl font-bold mb-8">Living Dex Tracker</h1>
			<p class="text-xl mb-8">
				Track your complete Pokémon collection across multiple games and regions. 
				Build your Living Dex with our unique Box View system that shows exactly 
				where each Pokémon belongs in your storage.
			</p>
			
			<div class="grid md:grid-cols-3 gap-6 mb-8">
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title text-primary">Box View</h3>
						<p>Visualize your collection in a 6×5 grid just like in the games</p>
					</div>
				</div>
				
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title text-secondary">Multi-Region Support</h3>
						<p>Track National or any of the 27 regional Pokédexes</p>
					</div>
				</div>
				
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title text-accent">Challenge Modes</h3>
						<p>Hunt shinies, track origins, or include all forms</p>
					</div>
				</div>
			</div>

			{#if data.session}
				<a href="/pokedexes" class="btn btn-primary btn-lg">
					View My Pokédexes
				</a>
			{:else}
				<div class="space-x-4">
					<a href="/signin" class="btn btn-primary btn-lg">
						Get Started
					</a>
					<a href="/about" class="btn btn-outline btn-lg">
						Learn More
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>

<div class="divider"></div>

<section class="py-16">
	<div class="max-w-6xl mx-auto px-4">
		<h2 class="text-3xl font-bold text-center mb-12">Features</h2>
		
		<div class="grid md:grid-cols-2 gap-8">
			<div class="flex gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-content">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
						</svg>
					</div>
				</div>
				<div>
					<h3 class="text-xl font-semibold mb-2">Box Organization</h3>
					<p class="text-base-content/70">
						See exactly which box and position each Pokémon belongs in, making it easy to organize your in-game storage.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-content">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
						</svg>
					</div>
				</div>
				<div>
					<h3 class="text-xl font-semibold mb-2">Track Progress</h3>
					<p class="text-base-content/70">
						Mark Pokémon as caught, ready to evolve, or stored in HOME. See completion percentages at a glance.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-content">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
						</svg>
					</div>
				</div>
				<div>
					<h3 class="text-xl font-semibold mb-2">Multiple Regions</h3>
					<p class="text-base-content/70">
						Create separate trackers for different regional Pokédexes or game-specific collections.
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div class="flex-shrink-0">
					<div class="w-12 h-12 bg-warning rounded-full flex items-center justify-center text-warning-content">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
						</svg>
					</div>
				</div>
				<div>
					<h3 class="text-xl font-semibold mb-2">Shiny Hunting</h3>
					<p class="text-base-content/70">
						Create dedicated shiny hunting trackers and mark your progress towards a complete shiny Living Dex.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>