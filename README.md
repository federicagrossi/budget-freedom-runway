# Freedom Budget

Crea un'applicazione Web e Mobile-friendly in React, Tailwind CSS e Lucide Icons chiamata "Freedom Runway". L'app serve a gestire il budget mensile basandosi sullo stipendio.

IMPORTANTE PER LA MANUTENZIONE MANUALE:
Poiché dovrò modificare questo codice manualmente avendo solo basi di HTML e CSS, ti chiedo di rispettare rigorosamente queste regole di sviluppo:
1. Scrivi tutto il codice principale in un unico file (es. App.tsx) o al massimo in 2 componenti separati molto chiari, per evitare che mi perda tra decine di cartelle.
2. Inserisci TUTTI i dati di configurazione (es. l'elenco dei CCNL con i relativi livelli e stipendi minimi, e le categorie di spesa) in variabili di testo (Array di Oggetti JSON) chiaramente visibili e commentate in CIMA al file. In questo modo potrò aggiornare cifre e testi modificando solo semplici stringhe o numeri.
3. Commenta in italiano ogni singola sezione del layout HTML/TSX (es. "<!-- INIZIO CARD BILANCIO -->") spiegando a cosa servono le classi Tailwind utilizzate, così saprò esattamente dove mettere le mani per cambiare colori, margini o testi.

FUNZIONALITÀ DA IMPLEMENTARE:

1. CONFIGURAZIONE ENTRATE (STIPENDIO & CCNL):
- Permetti all'utente di scegliere tra due opzioni per impostare le entrate mensili:
  a) Inserimento Manuale: Un semplice campo di input numerico per inserire il netto mensile.
  b) Selettore CCNL: Due menu a tendina. Il primo per scegliere il settore (es. "Federculture", "Commercio") e il secondo per scegliere il livello (es. "Livello C1", "Livello D1"). L'app deve pescare il valore corrispondente dall'array di configurazione in cima al codice e impostarlo come budget mensile.

2. OCR EXPENSE SCANNER (SIMULATO):
- Una sezione "Carica Scontrino" con un'area drag-and-drop o un pulsante per selezionare un file.
- Quando l'utente simula il caricamento di un'immagine, mostra un'animazione di caricamento ("Analisi AI dello scontrino in corso...") per 2 secondi.
- Successivamente, l'app deve compilare automaticamente un form con dati estratti fittizi (es. Esercente: "Coop", Importo: 34.50€, Data: oggi, Categoria: "Alimentari").
- Un pulsante "Conferma e Registra Spesa" aggiunge la transazione all'elenco.

3. AI BUDGET ASSISTANT (CHAT SIMULATA):
- Un'interfaccia di chat in basso a destra o in una scheda dedicata.
- L'utente può scrivere un messaggio. Se scrive domande tipo "Posso spendere 50€ per un ristorante?" o "Come sta andando il mio budget?", la chat deve rispondere simulando un agente AI che analizza il budget impostato al punto 1 e le spese inserite al punto 2 (es. "Sì, hai ancora il 60% del tuo budget mensile disponibile...").

4. DASHBOARD E LISTA TRANSAZIONI:
- Un indicatore visivo ad anello o una barra di avanzamento (stile widget iOS/Android) che mostra la percentuale di budget speso rispetto alle entrate configurate.
- Una tabella/lista semplice delle ultime transazioni aggiunte, con un'icona per categoria e un pulsante per eliminare la singola riga.

STILE GRAFICO:
- Usa un design moderno "Teal/Verde Acqua" (tonalità moderne di verde acqua, sfondi chiari/grigio-azzurri puliti, testi scuri).
- Layout mobile-first, pulito, spazioso e con angoli arrotondati sulle card.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1e1afc83-43f6-488d-ae54-4d85695280ef).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
