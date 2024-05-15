<svelte:head>
	<title>About Us</title>
	<meta name="description" content="About this app" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap"
		rel="stylesheet"
	/>

	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Staatliches&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="content h-full bg-base inline-block">
	<div id="grad">
		<div id="banner-content">
			<p class=" text-xs opacity-70 tracking-wide">Learn</p>
			<h2 class=" mt-0 pt-0 text-5xl tracking-widest text-center font-bold p-24">
				About<br /> Us
			</h2>
		</div>
	</div>

	<div id="introduction">
		<p class="font-semibold text-xl mb-5 ml-5">
			Introducing <span class="typewriter-text underline decoration-accent">Living Dex Tracker</span
			>
		</p>
		<p class="text-base mt-10 mb-5 ml-5 mr-5">
			<img src="/placeholder-bulb.png" alt="bulb" class="float-right w-28" />
			Living Dex Tracker is dolor sit amet, consectetur adipiscing elit. Proin dignissim risus eu quam
			feugiat malesuada. Vivamus arcu sapien, feugiat sed lacus ut, malesuada congue nibh. In lacinia
			lacus quis bibendum pulvinar. Aliquam in suscipit risus. Aliquam ut justo dolor.
		</p>

		<p class="font-semibold text-xl mt-20 mb-5 ml-5">Features</p>

		<!-- TODO (#41) - Make this a card carousel -->
		<div class="card md:card-side bg-base-00 shadow-m">
			<figure>
				<img src="/OIG3.jpeg" alt="Album" />
			</figure>
			<div class="card-body">
				<p class="card-title">Player Dex Search</p>
				<p>Find and explore your friends' Pokémon collections effortlessly.</p>
			</div>
		</div>

		<div class="bg-neutral pb-20">
			<p class="font-semibold text-white text-xl mt-0 mb-5 ml-5">Meet The Team</p>
			<div class="avatar flex items-center justify-end mb-20">
				<p class="text-m mb-5 ml-5 mr-5">Team Member 1</p>
				<div class="w-24 rounded-full flex justify-end">
					<img src="/OIG5.jpg" alt="profile" />
				</div>
			</div>
			<div class="avatar">
				<div class="w-24 rounded-full">
					<img src="/OIG5.jpg" alt="profile " />
				</div>

				<p class="text-m mb-5 ml-5 mr-5">Team Member 2</p>
			</div>
		</div>

		<div id="project-details">
			<p class="font-semibold text-xl mt-10 mb-5 ml-5">The Developement</p>
			<p class="text-sm mb-5 ml-5 mr-5">
				Share insights into the development process, challenges faced, and any interesting anecdotes
				or milestones achieved during the project's journey.
			</p>

			<ul class="timeline timeline-vertical">
				<li>
					<div class="timeline-start timeline-box">Example</div>
					<div class="timeline-middle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5 text-primary"
							><path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
								clip-rule="evenodd"
							/></svg
						>
					</div>
					<hr class="bg-primary" />
				</li>
				<li>
					<hr class="bg-primary" />
					<div class="timeline-middle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5 text-primary"
							><path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
								clip-rule="evenodd"
							/></svg
						>
					</div>
					<div class="timeline-end timeline-box">Example</div>
					<hr class="bg-primary" />
				</li>
				<li>
					<hr class="bg-primary" />
					<div class="timeline-start timeline-box">Example</div>
					<div class="timeline-middle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5 text-primary"
							><path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
								clip-rule="evenodd"
							/></svg
						>
					</div>
					<hr />
				</li>
				<li>
					<hr />
					<div class="timeline-middle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
							><path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
								clip-rule="evenodd"
							/></svg
						>
					</div>
					<div class="timeline-end timeline-box">Example</div>
					<hr />
				</li>
				<li>
					<hr />
					<div class="timeline-start timeline-box">Example</div>
					<div class="timeline-middle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
							><path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
								clip-rule="evenodd"
							/></svg
						>
					</div>
				</li>
			</ul>
		</div>

		<p class="font-semibold text-xl mt-10 mb-5 ml-5">Join Us On Discord!</p>

		<div id="contact-information ">
			<a href="https://discord.gg/2ytj4pkUPY">
				<button
					class="relative inline-flex items-center justify-center w-16 p-0.5 ml-5 mb-20 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
				>
					<img src="/discord1.svg" class="w-12" /></button
				>
			</a>
		</div>

		<div class="contact-form">
			<p class="font-semibold text-xl mt-0 mb-5 text-white pt-10">Contact Form</p>
			<input type="text" name="first" placeholder="First Name" autocomplete="off" required />
			<input type="text" name="last" placeholder="Last Name" autocomplete="off" required />
			<input type="email" name="Email" placeholder="Email Address" autocomplete="off" required />
			<textarea
				rows="5"
				cols="50"
				name="message"
				placeholder="Enter text"
				autocomplete="off"
				required
			/>
			<button type="submit" id="submit-button">Send Message</button>
		</div>

		<div id="legal-information">
			<p class="font-semibold text-xl mt-0 mb-5 ml-5 text-white pt-10">Legal</p>

			<p class="text-sm mb-5 ml-5 mr-5">
				Living Dex Tracker is a fan-made website dedicated to providing information about Pokemon
				creatures. We do not claim ownership of any Pokemon characters, images, or other content
				featured on this website.
				<br /><br />We do not generate revenue from the use of Pokemon content. Any advertisements
				or sponsored content on this website are unrelated to Pokemon and are used solely to support
				the maintenance and operation of the website.
			</p>
		</div>

		<div id="Acknowledgments">
			<p class="font-semibold text-xl mt-0 mb-5 ml-5 text-white pt-10">Acknowledgments</p>
			<p class="text-sm mb-5 ml-5 mr-5">
				Express gratitude to any individuals or organisations that have contributed to the project's
				success, including sponsors, supporters, or open-source contributors.
			</p>
		</div>
	</div>
</div>

<style>
	#banner-content {
		padding-top: 170px;
	}
	#grad {
		font-family: 'Pixelify Sans', sans-serif;
		font-weight: 400;
		font-style: normal;

		width: 100%;
		height: 422px;
		margin: 0 auto;
		background: linear-gradient(45deg, #d2001a, #7462ff, #f48e21, #23d5ab);
		color: #fff;
		background-size: 300% 300%;
		animation: color 12s ease-in-out infinite;
		text-align: center;
	}
	@keyframes color {
		0% {
			background-position: 0 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0 50%;
		}
	}

	#introduction .font-semibold {
		font-family: 'Staatliches', sans-serif;
		font-weight: 400;
		font-style: normal;
		font-size: 25px;
		padding-top: 20px;
	}

	.avatar {
		margin-left: 10px;
		margin-right: 10px;
	}

	.contact-form {
		background-color: rgb(216, 224, 178);
		width: 380px;
		height: 590px;
		border-radius: 20px;
		margin-bottom: 40px;
		margin-left: 10px;
		margin-right: 10px;
	}

	.contact-form > p {
		margin-left: 9px;
	}
	input {
		background-color: rgb(156, 186, 139);
		width: 70%;
		margin-left: 12%;
		padding: 16px 16px;
		border-radius: 10px;
		border-color: rgb(131, 167, 124);
		border-width: 2px;
		margin-bottom: 20px;
		font-family: 'Staatliches', sans-serif;
	}

	textarea {
		background-color: rgb(156, 186, 139);
		width: 70%;
		margin-left: 12%;
		padding: 16px 16px;
		border-radius: 10px;
		border-color: rgb(83, 145, 50);
		margin-bottom: 25px;
		font-family: 'Staatliches', sans-serif;
	}

	input:focus-within {
		outline: none;
		border-color: rgb(169, 227, 157);
		border-width: 3px;
		font-family: 'Staatliches', sans-serif;
	}
	textarea:focus-within {
		outline: none;
		border-color: rgb(169, 227, 157);
		border-width: 3px;
	}

	#submit-button {
		background-color: rgb(185, 201, 135);
		border-radius: 20px;
		border-color: #fff;
		padding: 10px 18px;
		text-align: center;
		display: flex;
		margin: auto;
		margin-bottom: 20px;
	}

	button:hover {
		opacity: 80%;
		cursor: pointer;
	}
</style>
