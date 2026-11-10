# Ucurifunke Quick Combat Actions

Kompakte, ausschließlich für Spielleiter sichtbare Handlungsleiste für Foundry VTT 14 und Ucurifunke. Voraussetzung ist **Tick Based Combat (`tick-combat`) ab Version 0.3.5**.

## Installation

1. In Foundry unter **Add-on Modules → Install Module** diese Manifest-URL eintragen:

   ```text
   https://github.com/Tschuangtse/Ucurifunke_Quick_Combat_Actions/releases/latest/download/module.json
   ```

2. **Install** auswählen und die erforderliche Abhängigkeit **Tick Based Combat** mitinstallieren, falls Foundry dies anbietet.
3. In der Welt unter **Manage Modules** sowohl **Tick Based Combat** als auch **Ucurifunke Quick Combat Actions** aktivieren.

Alternativ das Release-ZIP nach `Data/modules/ucurifunke-quick-combat-actions/` entpacken. `module.json`, `src/` und `styles/` müssen direkt in diesem Verzeichnis liegen. Danach Foundry neu starten. Die öffentliche Installation benötigt keine Zugangsdaten. Die stabile Manifest-URL dient auch zukünftigen Updates.

## Bedienung

Die vier Kategorien **Offensiv**, **Defensiv**, **Bewegung** und **Taktisch** befinden sich unten mittig über der Makroleiste. Ein Klick öffnet jeweils eine Kategorie. Erneutes Anklicken, der Pfeil im Listenkopf oder Escape bei Fokus in der Leiste klappt die Liste ein. Nach erfolgreicher Tickbuchung klappt sie automatisch ein.

Handlungsbuttons sind nur verfügbar, wenn im ausgewählten Encounter ein Kampf läuft und genau ein Token auf der aktuellen Szene ausgewählt ist, der zur Turnorder dieses Kampfes gehört. Die Zuordnung verwendet den Token und seine Szene, nicht den Akteur: Zwei Tokens desselben Akteurs werden getrennt behandelt. Ein Kampfteilnehmer muss für eine Reaktion nicht gerade am Zug sein.

Feste Kosten stehen als `Handlung (4 Ticks)` auf den Buttons. Bei `Handlung (variabel)` öffnet sich ein Zahlenfeld mit Pfeiltasten, das auch frei beschrieben werden kann: **Minimum 0, Vorgabe 8, Maximum 32, ganze Zahlen**. Eingetragen werden die **gesamten** Kosten inklusive etwaiger Modifikatoren, nicht nur ein Zuschlag. Abbrechen schließt den Dialog ohne Buchung; die Handlungsliste bleibt geöffnet. Bei geänderter Auswahl, Szene, Berechtigung oder geändertem Kampf wird die Buchung abgewiesen.

In den Moduleinstellungen lässt sich die Leiste pro Client ausblenden und ihr Abstand zum unteren Bildschirmrand zwischen 0 und 400 Pixeln einstellen (Vorgabe 80).

## Regeln und Umfang

Die 28 Buttons bilden die vier Kategorien im Kapitel **Handlungen im Kampf** des bereitgestellten Grundregelwerks ab. Die einzige Aufteilung ist **Parade (4 Ticks)** und **Parade mit Manöver (8 Ticks)**. Waffenabhängige Kosten, Nachladen, Rammen, Waffe ziehen, Fertigkeit nutzen und Zielen verwenden den variablen Dialog. Hinweise zu den Kosten stehen im Tooltip und bei variablen Handlungen zusätzlich im Dialog.

Die Leiste verbucht ausschließlich Ticks auf den ausgewählten Kampfteilnehmer. Sie würfelt nicht, bewegt keine Tokens und verändert weder Lebensenergie noch Zustände, Ausrüstung oder Zielpersonen. Bei **Zurückreißen** und **Rammen** werden zusätzliche Ticks anderer Beteiligter separat verwaltet. Für Formationen und das Reichen einer Waffe handelt jedes Mitglied einzeln.

Fortlaufende Handlungen werden mit ihrer eingegebenen Gesamtdauer gebucht; ihre regelgemäße Aufteilung in 8-Tick-Intervalle, Unterbrechungen und die spätere Ausführung ihres Effekts werden nicht automatisiert. Sonderfertigkeiten, kostenlose Kombinationen und Erleichterungen beurteilt der Spielleiter. Der Dialog folgt dem vereinbarten Bereich 0–32; der Hinweis für **Zielen** nennt zusätzlich das reguläre Maximum von 16 Ticks.

## TickBasedCombat-Anbindung

Die Integrationsstelle ist `src/combat.js`. Die lokale TickBasedCombat-Version 0.3.5 exportiert keine öffentliche `module.api`. Das Modul importiert daher `getCombatantInfo`, `setTicks` und `normalizeTicks` aus `tick-combat/src/data.js`. Relative Modul-URLs erhalten einen eventuell konfigurierten Foundry-URL-Präfix. Änderungen an dieser Schnittstelle erfordern eine Anpassung des Adapters.

Es wird der aktuelle Tickwert gelesen, die Kosten werden addiert und die Normalisierung der Abhängigkeit aufgerufen. Deren Hooks aktualisieren die Zeitleiste. Normalisierung kann alle relativen Tickpositionen gleichzeitig verschieben; der relative Abstand zwischen den Beteiligten entspricht dennoch der Buchung. 0-Tick-Handlungen lösen keine Schreiboperation und keine Normalisierung aus. Notizen und weitere TickBasedCombat-Daten bleiben durch dessen Setter erhalten. Positive Kosten beenden dessen Wartezustand.

Die lokale Leiste sperrt weitere Buchungen, solange eine Handlung oder ein Kostendialog läuft. Gleichzeitige Eingaben verschiedener Spielleiter werden von der aktuellen Abhängigkeit nicht als atomare Tickaddition angeboten; solche Eingaben sollten nacheinander erfolgen.

## Entwicklung und Prüfung

Node.js 20 oder neuer, keine npm-Abhängigkeiten:

```sh
npm test
npm run build
```

`dist/` enthält danach `module.json` und `ucurifunke-quick-combat-actions-v14-0.1.1.zip`. Für ein neues Release die Version in `package.json` und `module.json` sowie die versionsgebundene Download-URL aktualisieren, testen und bauen. Anschließend beide Dateien an einen GitHub-Release mit dem Tag `v<VERSION>` anhängen. Die Moduldateien liegen im ZIP direkt auf der obersten Ebene, entsprechend dem Aufbau der TickBasedCombat-Releasepakete.

Die automatisierten Tests prüfen Kosten, Token-/Szenenzuordnung, Berechtigungen, Auswahlwechsel während asynchroner Abläufe und die Verwendung des TickBasedCombat-Setters. Das Paket enthält nur Laufzeitdateien und Dokumentation.

Für Version 0.1.0 wurden zusätzlich Browserprüfungen bei 1440 × 900, 800 × 600 und 390 × 640 Pixeln ausgeführt. Diese verwendeten das tatsächliche lokale TickBasedCombat-Datenmodul 0.3.5 für Setter und Normalisierung, mit simulierten Foundry-Dokumenten und simuliertem Dialograhmen. Geprüft wurden außerdem Dialoggrenzen, Abbruch, 0 Ticks, doppelte Auslösung, Auswahlwechsel, Einklappen und SL-Sichtbarkeit. Das ersetzt keinen Test in einer laufenden Foundry-Welt.

Vor produktiver Nutzung in Foundry 14 prüfen:

- Als SL Kampf starten, Teilnehmer auswählen und Schritt buchen; Zeitleiste kontrollieren.
- Variable Handlung mit 0, 8 und 32 bestätigen sowie den Dialog abbrechen.
- Keine/mehrere Tokens und einen Token außerhalb der Turnorder auswählen: Buttons bleiben deaktiviert.
- Während des Dialogs den Kampf beenden oder wechseln: keine Buchung.
- Mit zwei Tokens desselben Akteurs prüfen, dass nur der ausgewählte Teilnehmer betroffen ist.
- Als Spieler prüfen, dass die Leiste nicht sichtbar ist.

Foundry-spezifische Fensterdarstellung und die Integration in eine echte Welt benötigen zusätzlich diesen Praxistest.

Technische Referenzen: [Foundry-Modulentwicklung](https://foundryvtt.com/article/module-development/), [Foundry V14 DialogV2](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html), [TickBasedCombat](https://github.com/Tschuangtse/TickBasedCombat).
