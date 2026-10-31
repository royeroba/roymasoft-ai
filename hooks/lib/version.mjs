/**
 * Compara versiones numéricas `X.Y.Z`.
 * @param {string} a
 * @param {string} b
 * @returns {boolean} true si `a` es anterior a `b`
 */
export function versionLess(a, b) {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) < (pb[i] || 0);
	}
	return false;
}
