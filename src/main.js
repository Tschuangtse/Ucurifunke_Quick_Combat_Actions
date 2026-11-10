import { MODULE_ID, DEPENDENCY_ID, loadTickApi } from "./combat.js";
import { ActionDock } from "./dock.js";

let dock;
let scheduled = false;
function refresh() {
  if (!dock || scheduled) return;
  scheduled = true;
  queueMicrotask(() => { scheduled = false; dock.refresh(); });
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "enabled", {
    name: "Kampfhandlungen anzeigen", hint: "Kompakte Handlungsleiste anzeigen (nur für Spielleiter).",
    scope: "client", config: true, type: Boolean, default: true, onChange: refresh
  });
  game.settings.register(MODULE_ID, "bottomOffset", {
    name: "Abstand zum unteren Bildschirmrand", hint: "Abstand in Pixeln; 80 lässt Platz für die Makroleiste.",
    scope: "client", config: true, type: Number, default: 80, range: { min: 0, max: 400, step: 1 }, onChange: refresh
  });
});

Hooks.once("ready", async () => {
  if (!game.user?.isGM) return;
  if (!game.modules.get(DEPENDENCY_ID)?.active) {
    ui.notifications.error("Ucurifunke Kampfhandlungen benötigt Tick Based Combat.");
    return;
  }
  try { await loadTickApi(); }
  catch (error) {
    console.error(`${MODULE_ID} | TickBasedCombat konnte nicht geladen werden`, error);
    ui.notifications.error("TickBasedCombat-Schnittstelle nicht verfügbar. Bitte Version und Installation prüfen.");
    return;
  }
  dock = new ActionDock();
  dock.refresh();
});

for (const hook of ["controlToken", "canvasReady", "canvasTearDown", "createCombat", "updateCombat", "deleteCombat",
  "createCombatant", "updateCombatant", "deleteCombatant", "updateToken", "deleteToken", "updateUser", "renderCombatTracker"]) {
  Hooks.on(hook, refresh);
}
