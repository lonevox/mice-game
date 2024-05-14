<script lang="ts">
	import '../app.postcss';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { setInitialClassState, storePopup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	onMount(() => {
		// TODO: this is a temporary hack that solves https://github.com/skeletonlabs/skeleton/issues/2598
		setInitialClassState();
	})

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<slot />
