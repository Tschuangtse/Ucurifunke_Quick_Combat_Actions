import { VARIABLE_COST, parseCost } from "./actions.js";

export async function requestCost(action, selection) {
  // Construct text nodes for actor names; never interpolate world data into HTML.
  const content = document.createElement("div");
  content.className = "uqca-cost-content";
  const actor = document.createElement("p");
  actor.textContent = `Handlung für ${selection.combatant.name ?? selection.token.name ?? "Token"}`;
  const hint = document.createElement("p");
  hint.textContent = action.hint ?? "Gesamtkosten der Handlung in Ticks eingeben.";
  const label = document.createElement("label");
  label.textContent = "Ticks ";
  const input = document.createElement("input");
  Object.assign(input, {
    type: "number", name: "ticks", min: String(VARIABLE_COST.min), max: String(VARIABLE_COST.max),
    step: "1", value: String(VARIABLE_COST.default), required: true, autofocus: true
  });
  input.setAttribute("aria-label", "Tickkosten");
  label.append(input);
  content.append(actor, hint, label);

  return foundry.applications.api.DialogV2.prompt({
    window: { title: `${action.name} – Tickkosten` },
    classes: ["uqca-cost-dialog"],
    content,
    modal: true,
    rejectClose: false,
    ok: {
      label: "Ticks hinzufügen",
      callback: (_event, button) => {
        const field = button.form.elements.namedItem("ticks");
        if (!field.reportValidity()) throw new Error("Bitte eine ganze Tickzahl von 0 bis 32 eingeben.");
        return parseCost(field.value);
      }
    },
    render: (_event, dialog) => {
      const field = dialog.element.querySelector('input[name="ticks"]');
      field?.focus();
      field?.select();
    }
  });
}
