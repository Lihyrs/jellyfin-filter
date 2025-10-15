function parseUserPairsToParams(pairs) {
	if (!pairs) return;
	return pairs
		.split(/\s*;\s*/)
		.filter(Boolean)
		.map((item) => item.split(/\s*[:=]\s*/))
		.reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {});
}

export default parseUserPairsToParams;
