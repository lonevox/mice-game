<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import Fa6SolidCaretDown from 'virtual:icons/fa6-solid/caret-down';
	import Fa6BrandsGithub from 'virtual:icons/fa6-brands/github';
	import Fa6BrandsDiscord from 'virtual:icons/fa6-brands/discord';

	type Theme = {
		type: string,
		name: string,
		icon: string,
	}

	const themes: Theme[] = [
		{ type: 'skeleton', name: 'Skeleton', icon: '💀' },
		{ type: 'wintry', name: 'Wintry', icon: '🌨️' },
		{ type: 'modern', name: 'Modern', icon: '🤖' },
		{ type: 'rocket', name: 'Rocket', icon: '🚀' },
		{ type: 'seafoam', name: 'Seafoam', icon: '🧜‍♀️' },
		{ type: 'vintage', name: 'Vintage', icon: '📺' },
		{ type: 'sahara', name: 'Sahara', icon: '🏜️' },
		{ type: 'hamlindigo', name: 'Hamlindigo', icon: '👔' },
		{ type: 'gold-nouveau', name: 'Gold Nouveau', icon: '💫' },
		{ type: 'crimson', name: 'Crimson', icon: '⭕' }
	];

	let theme = $state<string>(localStorage.getItem("theme") ?? "skeleton");
	$effect(() => {
		document.body.setAttribute('data-theme', theme);
		localStorage.setItem("theme", theme);
	});
</script>

<AppBar background="bg-surface-50-950" padding="px-4 py-1" slotLead="space-x-4" slotTrail="space-x-2!">
	<svelte:fragment slot="lead">
		<p>Mice Game</p>
		<div class="text-xs">
			<span class="text-surface-600-400">Inspired by </span>
			<a class="hover:underline text-surface-800-200" href="https://kittensgame.com" target="_blank" rel="noreferrer">
				Kittens Game
			</a>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<div>
			<!-- trigger -->
			<button class="btn btn-sm hover:preset-tonal-primary space-x-1" use:popup={{ event: 'click', target: 'theme', closeQuery: 'a[href]' }}>
				<span>Theme</span>
				<Fa6SolidCaretDown class="opacity-50"/>
			</button>
			<!-- popup -->
			<div class="card p-4 w-60 shadow-xl" data-popup="theme">
				<div class="space-y-4">
					<section class="flex justify-between items-center">
						<h6 class="h6">Mode</h6>
						<LightSwitch />
					</section>
					<hr />
					<nav class="list-nav px-4 -m-4 max-h-64 lg:max-h-[500px] overflow-y-auto">
						<ul>
							<!-- , badge -->
							{#each themes as { icon, name, type }}
								<li>
									<button class="option w-full h-full" onclick={() => theme = type} class:preset-filled-primary-500={theme === type}>
										<span>{icon}</span>
										<span class="flex-auto text-left">{name}</span>
									</button>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
			</div>
		</div>
		<!-- external links -->
		<section class="space-x-1">
			<a class="btn-icon btn-icon-sm hover:preset-tonal-primary" href="https://github.com/lonevox/mice-game" target="_blank" rel="noreferrer">
				<Fa6BrandsGithub />
			</a>
<!--			TODO: Future discord server link-->
<!--			<a class="btn-icon btn-icon-sm hover:variant-soft-primary" href="" target="_blank" rel="noreferrer">-->
<!--				<Fa6BrandsDiscord />-->
<!--			</a>-->
		</section>
	</svelte:fragment>
</AppBar>
