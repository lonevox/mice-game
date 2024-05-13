<script lang="ts">
	import type { Building } from '$lib/core/building.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	let { building = $bindable() } = $props<{ building }>();

	function formatBuildingText(building: Building) {
		if (building.owned > 0) {
			return building.name + " (" + building.owned + ")";
		}
		return building.name;
	}
</script>

<div>
	<div class="btn-group variant-ghost w-full" use:popup={{ event: 'hover', target: 'popupHover-' + building.name, placement: 'right-start' }}>
		<button class="variant-filled-surface w-full" onclick={() => building.owned += 1}>{formatBuildingText(building)}</button>
		{#if building.owned > 0}
			<button onclick={() => building.owned -= 1}>Sell</button>
		{/if}
	</div>
	<div class="card p-4 w-72 shadow-xl z-10 duration-0" data-popup={"popupHover-" + building.name}>
		<p>{building.description}</p>
		<div class="arrow bg-surface-100-800-token"></div>
	</div>
</div>
