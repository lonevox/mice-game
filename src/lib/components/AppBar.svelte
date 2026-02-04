<script lang="ts">
	import Fa6BrandsGithub from 'virtual:icons/fa6-brands/github';
	import Fa6BrandsDiscord from 'virtual:icons/fa6-brands/discord';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import ThemeButton from '$lib/components/ThemeButton.svelte';
</script>

<AppBar class="bg-surface-50-950 px-4 py-1">
	<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
		<AppBar.Lead class="space-x-4">
			<p>Mice Game</p>
		</AppBar.Lead>
		<AppBar.Headline>
			<div class="text-xs">
				<span class="text-surface-600-400">Inspired by </span>
				<a class="hover:underline text-surface-800-200" href="https://kittensgame.com" target="_blank" rel="noreferrer">
					Kittens Game
				</a>
			</div>
		</AppBar.Headline>
		<AppBar.Trail class="space-x-2!">
			<ThemeButton />
			<!-- external links -->
			<a class="btn py-2 hover:preset-tonal" href="https://github.com/lonevox/mice-game"
				 target="_blank" rel="noreferrer">
				<Fa6BrandsGithub />
			</a>
			<a class="btn py-2 hover:preset-tonal" href="https://discord.gg/sgC9JjRer4" target="_blank"
				 rel="noreferrer">
				<Fa6BrandsDiscord />
			</a>
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
