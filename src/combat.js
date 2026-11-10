export const MODULE_ID = "ucurifunke-quick-combat-actions";
export const DEPENDENCY_ID = "tick-combat";

// Token identity matters: multiple tokens can share the same actor.
export function getSelection(game, canvas) {
  if (!game.user?.isGM) return { error: "Nur der Spielleiter kann Kampfhandlungen ausführen." };
  if (!game.modules.get(DEPENDENCY_ID)?.active) return { error: "Tick Based Combat muss aktiviert sein." };
  const combat = game.combat;
  if (!combat?.started) return { error: "Kein laufender Kampf ausgewählt." };
  if (!canvas?.ready || !canvas.scene) return { error: "Keine Szene aktiv." };
  const selected = canvas.tokens?.controlled ?? [];
  if (selected.length !== 1) return { error: "Genau ein Token auswählen." };
  const token = selected[0];
  const sceneId = token.document?.parent?.id ?? canvas.scene.id;
  const combatants = [...(combat.combatants ?? [])].filter(candidate =>
    candidate.tokenId === token.id && (candidate.sceneId ?? combat.scene?.id) === sceneId
  );
  if (combatants.length !== 1) return { error: "Der ausgewählte Token muss eindeutig zur Turnorder dieses Kampfes gehören." };
  return { combat, combatant: combatants[0], token, sceneId };
}

export function assertSameSelection(expected, current) {
  if (current.error) throw new Error(current.error);
  if (current.combat !== expected.combat || current.combatant.id !== expected.combatant.id
    || current.token.id !== expected.token.id || current.sceneId !== expected.sceneId) {
    throw new Error("Kampf oder Tokenauswahl wurde geändert. Bitte die Handlung erneut wählen.");
  }
}

// TickBasedCombat 0.3.5 has no module.api. Keep its source API coupling here.
// Relative URL preserves a possible Foundry route prefix.
export async function loadTickApi() {
  const api = await import("../../tick-combat/src/data.js");
  for (const name of ["getCombatantInfo", "setTicks", "normalizeTicks"]) {
    if (typeof api[name] !== "function") throw new Error("Die TickBasedCombat-Schnittstelle ist nicht kompatibel.");
  }
  return api;
}

export async function addActionTicks(expected, ticks, { game, canvas, loadApi = loadTickApi }) {
  if (!Number.isInteger(ticks) || ticks < 0 || ticks > 32) throw new Error("Ungültige Tickkosten.");
  assertSameSelection(expected, getSelection(game, canvas));
  const api = await loadApi();
  // Loading the dependency is asynchronous. Recheck permissions and identity afterward.
  assertSameSelection(expected, getSelection(game, canvas));
  if (ticks === 0) return;
  const current = api.getCombatantInfo(expected.combatant).ticks;
  if (!Number.isInteger(current)) throw new Error("Der aktuelle Tickwert ist ungültig.");
  await api.setTicks(expected.combatant, current + ticks);
  await api.normalizeTicks(expected.combat);
}
