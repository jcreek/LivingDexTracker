<script lang="ts">
	import { onMount } from 'svelte';

	let showSuccess = false;

	onMount(() => {
		// Trigger success animation after component mounts
		setTimeout(() => {
			showSuccess = true;
		}, 100);
	});
</script>

<svelte:head>
	<title>Welcome - Living Dex Tracker</title>
	<meta
		name="description"
		content="Welcome to Living Dex Tracker! Check your email to verify your account."
	/>
</svelte:head>

<div class="min-h-[calc(100vh-16rem)] bg-base-100 py-8 md:py-16 px-4 sm:px-6 lg:px-8">
	<div class="max-w-6xl mx-auto">
		<!-- Success Badge -->
		{#if showSuccess}
			<div class="flex justify-center mb-8 animate-fade-in">
				<div class="badge badge-success badge-lg gap-2 p-6 shadow-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="text-lg font-semibold">Account Created Successfully!</span>
				</div>
			</div>
		{/if}

		<!-- Hero Content -->
		<div class="hero">
			<div class="hero-content flex-col lg:flex-row-reverse gap-8 lg:gap-12 w-full">
				<!-- Main Content -->
				<div class="text-center lg:text-left flex-1 space-y-6">
					<h1
						class="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
					>
						Welcome to Living Dex Tracker!
					</h1>

					<div class="space-y-4 text-base md:text-lg">
						<!-- Email Verification Section with Icon -->
						<div class="flex items-start gap-4 p-4 bg-info/10 rounded-lg border-l-4 border-info">
							<div class="flex-shrink-0 mt-1">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-8 w-8 text-info animate-pulse"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div class="flex-1">
								<p class="font-semibold text-info mb-1">Check Your Email</p>
								<p class="text-sm opacity-90">
									We've sent you a magic link to verify your account. Click the link in your email
									to sign in and start tracking your Pokédex progress.
								</p>
							</div>
						</div>

						<p class="opacity-80">
							After clicking the link, you'll be automatically signed in and can start tracking your
							Pokémon catches across all generations!
						</p>

						<!-- Help Section -->
						<div class="pt-4">
							<p class="text-sm opacity-70">
								<span class="font-semibold">Haven't received the email?</span> Check your spam or junk
								folder.
							</p>
							<p class="text-sm opacity-70 mt-2">
								Still having trouble?
								<a
									href="https://github.com/jcreek/LivingDexTracker/issues"
									class="link link-primary font-semibold hover:underline"
								>
									Raise an issue on our GitHub
								</a> for assistance.
							</p>
						</div>
					</div>
				</div>

				<!-- What's Next Card -->
				<div
					class="card w-full max-w-md shadow-2xl bg-neutral hover:shadow-3xl transition-shadow duration-300"
				>
					<div class="card-body">
						<h2 class="card-title text-2xl mb-4 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 text-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							What's Next?
						</h2>

						<ul class="space-y-4">
							<li class="flex items-start gap-3 group">
								<div class="flex-shrink-0 mt-1">
									<div
										class="w-6 h-6 rounded-full bg-success flex items-center justify-center group-hover:scale-110 transition-transform"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 text-success-content"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="3"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
								</div>
								<div class="flex-1">
									<p class="font-semibold">Check your email</p>
									<p class="text-sm opacity-70">Look for our verification email in your inbox</p>
								</div>
							</li>

							<li class="flex items-start gap-3 group">
								<div class="flex-shrink-0 mt-1">
									<div
										class="w-6 h-6 rounded-full bg-success flex items-center justify-center group-hover:scale-110 transition-transform"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 text-success-content"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="3"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
								</div>
								<div class="flex-1">
									<p class="font-semibold">Click the magic link</p>
									<p class="text-sm opacity-70">This will sign you in and verify your account</p>
								</div>
							</li>

							<li class="flex items-start gap-3 group">
								<div class="flex-shrink-0 mt-1">
									<div
										class="w-6 h-6 rounded-full bg-success flex items-center justify-center group-hover:scale-110 transition-transform"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4 text-success-content"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="3"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
								</div>
								<div class="flex-1">
									<p class="font-semibold">Start tracking your Pokémon</p>
									<p class="text-sm opacity-70">
										Create your first Pokédex and begin your journey!
									</p>
								</div>
							</li>
						</ul>

						<!-- Additional Info -->
						<div class="mt-6 pt-6 border-t border-base-300">
							<div class="flex items-center gap-2 text-sm opacity-70">
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
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>The verification link expires in 24 hours</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Additional Features Preview -->
		<div class="mt-16 text-center">
			<h3 class="text-2xl font-bold mb-6">What You Can Do With Living Dex Tracker</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
					<div class="card-body items-center text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-12 w-12 text-primary mb-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<h4 class="font-semibold">Track Multiple Pokédexes</h4>
						<p class="text-sm opacity-70">
							Manage different Living Dex challenges across all generations
						</p>
					</div>
				</div>

				<div class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
					<div class="card-body items-center text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-12 w-12 text-secondary mb-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<h4 class="font-semibold">Share Your Progress</h4>
						<p class="text-sm opacity-70">Connect with friends and share your Pokédex journey</p>
					</div>
				</div>

				<div class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
					<div class="card-body items-center text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-12 w-12 text-accent mb-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
							/>
						</svg>
						<h4 class="font-semibold">Works Offline</h4>
						<p class="text-sm opacity-70">Track your catches even without an internet connection</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out forwards;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	/* Respect user's motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.animate-fade-in,
		.animate-pulse {
			animation: none;
		}

		.group-hover\:scale-110 {
			transform: none !important;
		}
	}

	/* Gradient text fallback for older browsers */
	@supports not (background-clip: text) {
		h1 {
			background: none;
			color: hsl(var(--p));
		}
	}
</style>
