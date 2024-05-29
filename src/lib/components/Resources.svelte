<script lang="ts">
	import { Resource, resources } from '$lib/core/resource.svelte';
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { onMount } from 'svelte';
	import { formatDecimal, formatPerSecondNumber } from '$lib/core/util.svelte';
	import LinkTree from '$lib/components/LinkTree.svelte';

	let floating;
	onMount(() => {
		floating = document.getElementById("resource-popup");
	})

	type PopupType = "name" | "maxAmount" | "production";
	type PopupDisplay = {
		type: PopupType,
		resource: Resource,
	}
	let popupDisplay = $state<PopupDisplay>({});

	function repositionPopup(e) {
		const rect = e.target.getBoundingClientRect();
		const x = rect.right;
		const y = rect.top;

		const virtualEl = {
			getBoundingClientRect() {
				return {
					width: 0,
					height: 0,
					x: x,
					y: y,
					left: x,
					right: x,
					top: y,
					bottom: y
				};
			}
		};

		computePosition(virtualEl, floating, {
			placement: "right-start",
			middleware: [offset(5), flip(), shift()]
		}).then(({ x, y }) => {
			Object.assign(floating.style, {
				top: `${y}px`,
				left: `${x}px`,
				visibility: "visible",
			});
		});
	}

	function setPopup(e, type: PopupType, resource: Resource) {
		repositionPopup(e);
		popupDisplay = {
			type: type,
			resource: resource,
		};
	}

	function onMouseEnterPropertyCell(e, resource: Resource, property: PopupType) {
		if (resource[property] !== 0 || resource.getLinksToProperty(property).length > 0) {
			setPopup(e, property, resource);
		}
	}

	function hidePopup() {
		Object.assign(floating.style, {
			visibility: "hidden",
		});
	}
</script>

<div class="space-y-1">
	<h4 class="h4">Resources</h4>
	<div class="mx-auto w-96 grid grid-cols-[minmax(0,auto)_4.5rem_5rem_6rem] gap-x-2 gap-y-1 border-4 rounded-md border-surface-50-900-token bg-surface-50-900-token">
		{#each Object.values(resources) as resource}
			<!-- Name -->
			<div
				class="truncate hover:bg-surface-100-800-token"
				style="color: {resource.rarity.color}"
				onmouseenter={e => setPopup(e, "Name", resource)}
				onmouseleave={() => hidePopup()}
				role="tooltip"
			>{resource.name.toLowerCase()}</div>
			<!-- Amount -->
			<div
				class="text-surface-900-50-token hover:bg-surface-100-800-token"
			>{formatDecimal(resource.amount)}</div>
			<!-- Max amount -->
			<div
				class="text-surface-400-500-token hover:bg-surface-100-800-token"
				onmouseenter={e => onMouseEnterPropertyCell(e, resource, "maxAmount")}
				onmouseleave={() => hidePopup()}
				role="tooltip"
			>/{formatDecimal(resource.maxAmount)}</div>
			<!-- Production -->
			<div
				class="text-surface-900-50-token hover:bg-surface-100-800-token"
				onmouseenter={e => onMouseEnterPropertyCell(e, resource, "production")}
				onmouseleave={() => hidePopup()}
				role="tooltip"
			>{formatPerSecondNumber(resource.production)}</div>
		{/each}
	</div>
	<!-- Popup -->
	<div id="resource-popup" class="card p-3 shadow-xl space-y-2 z-10 absolute invisible">
		{#if popupDisplay.type === "name"}
			<p>{popupDisplay.resource.displayName}</p>
			{#if popupDisplay.resource.description !== "" }
				<hr />
				<p>{popupDisplay.resource.description}</p>
			{/if}
		{:else if popupDisplay.type === "maxAmount"}
			<LinkTree bind:resource={popupDisplay.resource} property="maxAmount" />
		{:else if popupDisplay.type === "production"}
			<LinkTree bind:resource={popupDisplay.resource} property="production" propertyFormatter={v => formatPerSecondNumber(v)} />
		{/if}
	</div>
</div>
