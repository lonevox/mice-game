<script lang="ts">
	import { logs } from '$lib/core/logs.svelte';
</script>

<div>
	<h4 class="h4">Log</h4>
	<p class="italic text-surface-700-200-token">You are a mouse in a clearing of grain.</p>
	<hr />
	<button class="text-surface-500-400-token" onclick={() => logs.length = 0}>Clear log</button>
	{#each logs as log}
		<p class="text-sm">{log}</p>
	{/each}
</div>
