# IVY AUTOMATION // OUTPOST – V1

Spielbarer Automatisierungs-/Tower-Defense-Prototyp im IVY-Design. Reine HTML/CSS/JavaScript-PWA ohne externe Laufzeitbibliotheken.

## GitHub Pages

Den Inhalt des ZIP direkt in ein neues GitHub-Repository laden. Unter **Settings → Pages** die Veröffentlichung aus `main` und `/ (root)` aktivieren. Anschließend die GitHub-Pages-URL öffnen. Die Offline-Version wird beim ersten Online-Laden im Cache gespeichert; nach Änderungen am Service Worker ggf. erneut öffnen.

## Spielziel

Das sechsstufige Zielsystem führt durch den Aufbau einer Produktionskette bis zur dritten Gegnerwelle.

## Fabrik

- **Bohrer (⛏)**: auf Erz-, Kohle- oder Kristalllagerstätten platzieren, mit Auslass Richtung Abnehmer.
- **Förderband (⇢)**: transportiert ein Werkstück in Pfeilrichtung, Zwischenlager je Feld.
- **Schmelzofen (♨)**: nimmt Erz an und verarbeitet es zu Metallplatten; bei Produktion gibt es zusätzlich Metall als Bauressource.
- **Fabrik (⚙)**: nimmt Metallplatten an und erzeugt Munition.
- **Generator (⚡)**: verbraucht Kohle aus dem Vorrat und stellt vier Leistungseinheiten bereit; überlastete Netze stoppen die Produktion.
- **Geschützturm (⌖)**: bekämpft Gegner automatisch im Radius, verbraucht Munition.
- **Mauer (▥)**: dekoratives Hindernis in V1; Gegner greifen den Kern an.

## Starttipp

Ein Bohrer ist bereits platziert. Du kannst neben einer Erzader einen weiteren Bohrer errichten, dessen Ausgang nach Osten zu einem Schmelzofen zeigt; der Schmelzofen gibt seine Metallplatten Richtung Osten an die Munitionsfabrik ab. Drehe vor dem Platzieren mit ↻. Eine Fabrik kann Munition auch dann im gemeinsamen Vorrat ablegen, wenn hinter ihr kein Abnehmer steht. Stelle einen Turm nahe dem Kern auf und sorge für genügend Energie.

## Bedienung

PC: Bauwerkzeug links wählen, Feld anklicken, `R` für Drehen, Rechtsklick zum Entfernen, Leertaste für Pause. Smartphone: Werkzeug in der unteren Leiste wählen, Feld antippen, ↻ zum Drehen. Zoom über +/−. Menü oben rechts enthält JSON-Speicherexport/-import und Neustart.

## Sicherheit / Speicher

Der Spielstand wird unter `ivyAutomationV1` in localStorage gespeichert. Keine Accounts, Telemetrie oder Netzwerkverbindung außer dem erstmaligen Laden der eigenen App-Dateien. Nicht den Browser-Site-Speicher löschen, wenn der Spielstand bleiben soll. Exportiere einen JSON-Spielstand als Backup.

## Testen

`node test_engine.js` führt 24 Simulationschecks aus. `python browser_test.py` prüft HTML/CSS/JS direkt in Chromium (Playwright erforderlich). Die Engine- und Browsertests wurden in der Erstellungsumgebung erfolgreich ausgeführt. Echter PWA-Offline-Start auf Android/Windows und reale Touch-Gesten über längere Spielsitzungen wurden nicht geprüft.

## Einschränkungen V1

Ein überschaubarer isometrischer Prototyp, kein 3D-Vollspiel: keine freie Kamera, kein aufwändiger Pathfinding-Algorithmus, keine Forschung, keine mehreren Szenarien und keine Audioeffekte. Gegner laufen geradlinig zum Basiskern. Die Simulationslogik kann als Grundlage für weitere Level, Baupläne, Forschung und fortgeschrittene Verteidigung erweitert werden.
