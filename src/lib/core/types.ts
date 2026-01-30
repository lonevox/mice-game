// types.ts
export type GameValue = {
	id: string;
	base: number;
	current?: number;
};

export type LinkType = 'add' | 'multiply' | 'divide' | 'subtract' | 'set' | 'max' | 'min';

export type Link = {
	from: string;
	to: string;
	type: LinkType;
	coefficient?: number;
	condition?: (state: GameState) => boolean;
	// Optional metadata for better display
	metadata?: {
		label?: string; // e.g., "Foraging Zone"
		description?: string;
	};
};

export type GameState = {
	values: Map<string, number>;
	links: Link[];
};

// New types for link analysis
export type LinkContribution = {
	link: Link;
	sourceValue: number;
	contribution: number;
	effectiveCoefficient: number;
};

export type ValueBreakdown = {
	baseValue: number;
	totalValue: number;
	contributions: LinkContribution[];
};
