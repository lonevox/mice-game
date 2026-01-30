<script lang="ts">
	import '../app.css';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { onMount } from 'svelte';

	onMount(() => {
		// TODO: this is a temporary hack that solves https://github.com/skeletonlabs/skeleton/issues/2598
		setInitialClassState();
	})

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<slot />
