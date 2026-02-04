import type { ModConfig } from '$lib/core/mod';
import { ResourceService } from '$lib/base_game/data_components/resource';
import { BuildingService } from '$lib/base_game/data_components/building';
import { LocationService } from '$lib/base_game/data_components/location';

export const data: ModConfig = {
	id: 'base_game',
	name: 'Base Game',
	description: 'The core content for Mice Game',
	dependencies: [],
	dataComponentTypes: {
		rarity: {},
		resource: {
			service: ResourceService
		},
		building: {
			dependencies: ['resource'],
			service: BuildingService
		},
		location: {
			dependencies: ['building'],
			service: LocationService
		}
	},
	dataComponents: {
		rarity: [
			{ id: 'common', name: 'Common', color: 'white' },
			{ id: 'uncommon', name: 'Uncommon', color: 'green' }
		],
		resource: [
			{
				id: 'grain',
				name: 'Grain',
				baseAmount: 50,
				baseMaxAmount: 100,
				baseProduction: 0,
				icon: '🌾'
			},
			{ id: 'wood', name: 'Wood', baseAmount: 50, baseMaxAmount: 50, baseProduction: 0, icon: '🪵' }
		],
		building: [
			{
				id: 'foraging_zone',
				name: 'Foraging Zone',
				description: 'Mice gather grain from the wild',
				basePrice: [{ resourceId: 'grain', amount: 10 }],
				basePriceScale: 1.15,
				icon: '🌿'
			},
			{
				id: 'granary',
				name: 'Granary',
				description: 'Increases grain storage capacity',
				basePrice: [{ resourceId: 'wood', amount: 50 }],
				basePriceScale: 1.2,
				icon: '🏠'
			}
		],
		location: [
			{ id: 'rath', name: 'Rath', unlocked: true, buildingIds: ['foraging_zone', 'granary'] },
			{ id: 'nib', name: 'Nib', unlocked: false, buildingIds: [] }
		]
	},
	links: [
		{
			from: 'foraging_zone_amount',
			to: 'grain_production',
			type: 'add',
			coefficient: 1,
			metadata: {
				label: 'Foraging Zones',
				description: 'Each Foraging Zone produces 1 grain per second'
			}
		},
		{
			from: 'granary_amount',
			to: 'grain_max_amount',
			type: 'add',
			coefficient: 50,
			metadata: {
				label: 'Granaries',
				description: 'Each Granary increases grain storage by 50'
			}
		}
	]
};
