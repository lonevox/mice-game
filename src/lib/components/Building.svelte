<script lang="ts">
	import type { Building } from '../building.svelte';
	let { building = $bindable() } = $props<{ building }>();

	function formatBuildingText(building: Building) {
		if (building.owned > 0) {
			return building.name + " (" + building.owned + ")";
		}
		return building.name;
	}
</script>

<div class="btn-group variant-ghost">
	<button class="variant-filled-surface w-full" onclick={() => building.owned += 1}>{formatBuildingText(building)}</button>
	{#if building.owned > 0}
		<button onclick={() => building.owned -= 1}>Sell</button>
	{/if}
</div>
