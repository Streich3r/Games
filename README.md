# IVY FORGE V2 — spielbare Sci-Fi-Fabrik

## Was sich im Vergleich zu V1 geändert hat

- Neue **2,5D-Isometrie-Grafik**: Gebäude haben mehrschichtige Gehäuse, Dachmodule, Anzeigen, Leuchtfelder, Schatten und Lichtquellen.
- Förderbänder zeigen animierte Laufsegmente, Richtung und tatsächlich bewegte Produktionsgüter.
- Industrieller Metallboden mit Gravuren, Kristall-/Erzvorkommen und Werkstattkonsole.
- Die neue Kampagne startet mit einem **bereits arbeitenden Produktions-Außenposten** (alle sichtbaren Maschinen sind echte Simulationseinheiten). Durch das Bauen erweiterst du ihn.
- Kinoansicht für ein nahezu bildschirmfüllendes Spielfeld (`▣`, alternativ Taste `C`).
- Kamera per Ziehen verschieben; auf Mobilgeräten per Zwei-Finger-Geste zoomen, am PC mit dem Mausrad.
- Neues Branding im IVY-Stil, App-Icons, Service Worker und ein Referenzbild im Missionsmenü.

**Wichtig zur Grafik:** Die Spielwelt verwendet gezeichnete, animierte Canvas-Objekte und ist **nicht** das hochgeladene Konzeptbild als statisches Spielfeld. Der Stil orientiert sich daran. Eine exakte 3D-/illustrative Bildqualität wie in der Vorlage würde zusätzliche individuell gerenderte Sprites oder 3D-Modelle erfordern. Das Referenzbild ist nur im Menü sichtbar.

## Auf GitHub Pages installieren

1. Den *Inhalt* des ZIP-Ordners hochladen, nicht das ZIP selbst.
2. Alle Dateien und den Unterordner `assets/` in die gleiche Verzeichnisstruktur legen.
3. Unter GitHub `Settings → Pages` den Branch `main` und `/ (root)` aktivieren.
4. GitHub-Pages-Seite öffnen. Bei einer bereits installierten V1-PWA ggf. einmal neu öffnen, damit der neue Service Worker aktiv wird.
5. Ein bestehender **V1-Spielstand wird beibehalten**. Um die neue volle V2-Startfabrik zu bekommen, Menü → `NEUE KAMPAGNE` wählen. Vorher bei Bedarf V1-Spielstand exportieren.

## Steuerung

| Aktion | PC | Smartphone |
|---|---|---|
| Bauen | Werkzeug auswählen und Feld anklicken | Werkzeug auswählen und Feld antippen |
| Kamera bewegen | Mit gedrückter Maustaste ziehen | Mit einem Finger über das Spielfeld ziehen |
| Zoom | Mausrad oder +/− | Zwei Finger oder +/− |
| Richtung | R oder ↻ | ↻ |
| Kinoansicht | C oder ▣ | ▣ |
| Löschen | Rechtsklick oder Löschen-Werkzeug | Löschen-Werkzeug |
| Spiel pausieren | Leertaste oder Pause | Pause |

## Spielfunktionen

Förderbänder, Bohrer, Schmelzöfen, Munitionsfabriken, Generatoren, Geschütztürme, Mauern, Feindwellen, sechs Kampagnenziele, automatische lokale Speicherung, JSON-Spielstand-Export und -Import.

## Technik und Datenschutz

- Statisch auf GitHub Pages gehostet, kein Backend nötig.
- Der Spielstand liegt lokal im Browser (`localStorage`, Schlüssel `ivyAutomationV1`), nicht in GitHub.
- Nach dem ersten erfolgreichen Laden soll die PWA dank `sw.js` auch offline gestartet werden können.
- Andere PWAs/Caches werden vom Service Worker nicht gezielt entfernt.
- Die Engine/Gameplay-Logik aus V1 bleibt abwärtskompatibel.

## Tests und Einschränkungen

- Engine: 24 von 24 Node-Tests.
- UI: 24 von 24 Browserchecks, Desktop + Mobile.
- Assets/PWA: 32 von 32 Checks (Dateien, Größen, Referenzen, Syntax).
- Chromium-Render auf Desktop/Mobil + Kinoansicht ohne JavaScript-Laufzeitfehler.
- Die App wurde durch direkt eingebetteten HTML-Code im lokalen Browser geprüft, weil normale Dateinavigation in der Testumgebung blockiert war.
- Der echte Installations-/Offline-Test auf GitHub Pages und die Zwei-Finger-Geste auf einem realen Smartphone sind noch nicht verifiziert.

Bilder der getesteten Ansichten und Testskripte befinden sich im Komplettpaket.
