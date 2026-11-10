# Änderungsprotokoll

## 0.1.1

- Fehler beim Öffnen variabler Tickkosten behoben: Der äußere Dialoginhalt ist jetzt ein attributfreies `div`, wie von Foundry V14 verlangt. Die CSS-Klasse liegt auf einem inneren Element.
- Regressionstest für alle acht variablen Handlungen ergänzt; Zahlenfeld und Kostenbereich 0–32 bleiben erhalten.

## 0.1.0

- Erste SL-Handlungsleiste für Foundry VTT 14 mit vier Kategorien und 28 Buttons.
- Anbindung an die lokale TickBasedCombat-Schnittstelle ab 0.3.5.
- Variable Tickkosten von 0 bis 32 mit Vorgabe 8 und manueller Eingabe.
- Automatisches und manuelles Einklappen, Auswahlprüfung, clientbezogene Anzeige- und Abstandseinstellungen.
- Automatisierte Logiktests und reproduzierbares Installationspaket ohne Build-Abhängigkeiten.
- GitHub-Release mit separater Manifestdatei, Installations-ZIP und stabiler Update-URL für Foundry.
