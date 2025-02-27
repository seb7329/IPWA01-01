## Voraussetzungen

- **Browser**: Google Chrome oder Apple Safari in den jeweils aktuellen Versionen.
- **Node.js und npm**: Stelle sicher, dass [Node.js](https://nodejs.org/) (inklusive npm) installiert ist.
- **HTTP-Server**: Zum Starten der Anwendung wird ein Node.js-basierter HTTP-Server benötigt, um CORS-Probleme zu vermeiden.

## Installation und Ausführung

Um die Webanwendung lokal zu starten, folge diesen Schritten:

1. **Node.js installieren**  
   Lade Node.js von [nodejs.org](https://nodejs.org/) herunter und installiere es, falls noch nicht geschehen.

2. **HTTP-Server installieren**  
   Öffne ein Terminal (oder die Eingabeaufforderung) und installiere den `http-server` global über npm:

    npm install -g http-server

    Dadurch wird der HTTP-Server global verfügbar, sodass du ihn von überall aus starten kannst.

3. **In das Projektverzeichnis wechseln**  
    Navigiere im Terminal in das Verzeichnis des Projekts. 

4. **HTTP-Server starten**  
    Starte den Server mit dem folgenden Befehl:

    http-server

5. **Webseite im Browser öffnen**  
    Öffne deinen Browser und navigiere zu der angezeigten URL, z.B. [http://127.0.0.1:8080](http://127.0.0.1:8080). Die Anwendung ist ausschließlich mit Google Chrome und Apple Safari getestet!