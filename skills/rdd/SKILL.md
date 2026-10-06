---
name: rdd
description: "Revisión de regresión con contexto fresco al cerrar un cambio con código. Trigger: terminaste un cambio que toca código, o el usuario pide 'revisa que no rompimos nada', 'revisión de regresión', 'RDD' o 'pasa o no pasa'. Lanza un subagente sin el contexto de la conversación que devuelve PASA o NO PASA con tabla."
disable-model-invocation: false
argument-hint: "opcional: qué revisar (por defecto, el cambio actual)"
---

# /rdd — Revisión fresca: PASA o NO PASA

Un subagente sin tu contexto revisa lo hecho, lo compara con la evidencia de antes y dice si introdujo regresiones o bugs nuevos. **No edita, no commitea.**

## 1. ¿Aplica?

- Omítela en cambios **pasivos** (documentación, comentarios, imágenes sin efecto ejecutable) y dilo en una línea.
- En el resto, ejecútala al cerrar el cambio. En un feature por fases, al final del feature, y por fase si el riesgo es alto.

## 2. Arma el paquete (nada de la conversación)

Reúne y pásalo en el prompt:

- **Objetivo y criterios de aceptación** (los `S#` del spec si hay, o el checklist de la HU).
- **Alcance:** archivos tocados y `git diff --stat`. El revisor corre el diff por su cuenta.
- **Evidencia base**, la de antes del cambio: `HEAD` de partida y si el árbol estaba sucio, la reproducción del bug (salida de comando, test en RED, captura), y los tests relacionados que pasaban y los que ya fallaban. Si no la registraste, dilo: el revisor tratará los fallos como bloqueos probables.
- **Comandos de verificación autorizados**, los que ya corriste. Sin build salvo que el usuario lo permita.
- **Riesgo** declarado.

## 3. Lanza el revisor

Agente `roymasoft-ai:reviewer`, en primer plano. El modelo por defecto es el del agente (opus, porque es una decisión). Para riesgo medio puedes pasar `sonnet` y ahorrar. Si el usuario eligió un modelo, pasa ese.

## 4. Actúa según el veredicto

- **PASA:** di "Implementación correcta", muestra los avisos si los hay y lo que no se pudo verificar.
- **NO PASA:** muestra la tabla tal cual. Corrige **todos los bloqueos en un solo lote** y relanza el revisor acotado a esos bloqueos. Un hallazgo nuevo en esa pasada no abre otra corrección.
- **Siguen abiertos:** un único "Necesito tu decisión" con los bloqueos pendientes. Nunca más de una corrección ni bucles.
- **Avisos:** se reportan; no se corrigen salvo que el usuario lo pida.

## 5. Si no se puede

Si el subagente no está disponible o falla, dilo con la causa. **No inventes un PASA.** Un cambio sin revisión se reporta como "sin revisión fresca".
