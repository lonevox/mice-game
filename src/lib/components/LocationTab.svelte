<script lang="ts">
	import { locations } from '$lib/core/building.svelte';
	import Building from '$lib/components/Building.svelte';
</script>

<div class="space-y-4">
	{#each Object.values(locations) as location}
		{#if location.unlocked}
			<div>
				<h4 class="h4 ml-2 mb-2">{location.name}</h4>
				<div class="grid grid-cols-2 gap-x-6 gap-y-4">
					{#each location.buildings as building, j}
						<Building bind:building={location.buildings[j]} />
					{/each}
				</div>
			</div>
		{/if}
	{/each}
</div>
