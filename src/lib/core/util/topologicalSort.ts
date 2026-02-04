/**
 * Performs a topological sort on items with dependencies.
 * Throws an error if a circular dependency is detected.
 */
export function topologicalSort<T>(items: T[], getDependencies: (item: T) => T[]): T[] {
	const result: T[] = [];
	const visited = new Set<T>();
	const visiting = new Set<T>(); // For cycle detection

	function visit(item: T, path: T[] = []) {
		if (visited.has(item)) {
			return;
		}

		if (visiting.has(item)) {
			const cycle = [...path, item].join(' -> ');
			throw new Error(`Circular dependency detected: ${cycle}`);
		}

		visiting.add(item);

		const deps = getDependencies(item);
		for (const dep of deps) {
			// Only visit if it's in our item list
			if (items.includes(dep)) {
				visit(dep, [...path, item]);
			}
		}

		visiting.delete(item);
		visited.add(item);
		result.push(item);
	}

	for (const item of items) {
		visit(item);
	}

	return result;
}
