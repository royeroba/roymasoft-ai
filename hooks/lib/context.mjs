/**
 * Arma el contexto que SessionStart inyecta. Claude Code corta la salida de un hook a 10.000
 * caracteres y deja solo un preview de 2.000 (https://code.claude.com/docs/en/hooks), así que las
 * secciones entran por prioridad y las que no caben se omiten con aviso en vez de truncarse en silencio.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const HOOK_OUTPUT_LIMIT = 10_000;
/** Tope de las reglas juntas: deja margen para los avisos de instalación y el aviso de omisión. */
export const RULES_BUDGET = 9_000;

export const charCount = (text) => [...text].length;

const stripComments = (text) => text.replace(/<!--[\s\S]*?-->\n?/g, '');

/**
 * Lee una regla de `rules/` sin los comentarios HTML, que no aportan al modelo.
 * @param {string} root raíz del plugin
 * @param {string} name archivo dentro de `rules/`
 * @returns {string}
 */
export function readRule(root, name) {
	return stripComments(readFileSync(join(root, 'rules', name), 'utf8')).trim();
}

/**
 * Une las secciones en orden de prioridad sin pasar el límite del hook.
 * @param {{ name: string, text: string }[]} sections de mayor a menor prioridad
 * @returns {string}
 */
export function composeContext(sections) {
	const reserve = 300;
	const kept = [];
	const skipped = [];
	let size = 0;
	for (const { name, text } of sections) {
		const cost = charCount(text) + 2;
		if (size + cost <= HOOK_OUTPUT_LIMIT - reserve) {
			kept.push(text);
			size += cost;
		} else {
			skipped.push(name);
		}
	}
	if (skipped.length) kept.push(`(roymasoft-ai: omitido por el límite de ${HOOK_OUTPUT_LIMIT} caracteres del hook: ${skipped.join(', ')}.)`);
	return kept.join('\n\n');
}
