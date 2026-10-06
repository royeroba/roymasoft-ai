# Plantilla de spec

Archivo: `specs/NN-slug.md`. Escríbelo en el idioma de los specs existentes (por defecto, el del usuario) y respeta el orden. Omite una sección sin contenido real y dilo en una línea; no la rellenes.

```markdown
# SPEC NN — <título corto>

> **Estado:** Borrador | Aprobado | Implementado | Obsoleto
> **Depende de:** SPEC NN (o "ninguno")
> **Fecha:** AAAA-MM-DD
> **Objetivo:** una sola frase.

## Alcance

**Entra:**
- ...

**No entra (otro spec):**
- ...

## Specs

- **S1.** "<frase literal del usuario>" — <alcance autorizado y criterio, sin reescribir la frase>
- **S2.** ...

## Datos (omitir si no hay datos nuevos y decirlo)

Estructuras con nombres reales y dónde viven.

## Plan

Cada fase deja el sistema funcionando.

- [ ] **Fase 1 — <nombre>** (S1): qué cambia y qué archivos. Verificación: `<comando>` → <resultado esperado>.
- [ ] **Fase 2 — <nombre>** (S2): ...

## Criterios de aceptación

- [ ] <criterio verificable, no aspiracional>

## Decisiones

- **Tomada:** <decisión> — <por qué>
- **Descartada:** <opción> — <por qué>

## Riesgos (omitir si no hay)

- <qué puede romperse y qué pasa en el caso degradado>

## Log

- **L1 · AAAA-MM-DD** — petición original del usuario, literal.
- **Base** — `HEAD` de partida, árbol limpio/sucio, reproducción, tests relacionados (pasan / ya fallaban).
- <fecha> — correcciones del usuario (literales), evidencia por fase, decisiones y próximo paso.
```
