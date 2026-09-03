import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Wallet,
  ScanLine,
  Bot,
  Trash2,
  Send,
  Loader2,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Film,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Upload,
} from "lucide-react";

/* ============================================================================
   ███ FREEDOM RUNWAY — FILE UNICO DELL'APPLICAZIONE ███
   Tutta la configurazione modificabile è QUI IN CIMA.
   Per cambiare cifre, testi o categorie basta modificare gli array sottostanti.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   1) TABELLA CCNL — settori, livelli e stipendio NETTO mensile stimato (euro)
   Per aggiungere un settore: copia un blocco { settore: ..., livelli: [...] }
   Per cambiare uno stipendio: modifica solo il numero dopo "netto:"
   ------------------------------------------------------------------------- */
const CCNL = [
  {
    settore: "Federculture",
    livelli: [
      { nome: "Livello A1", netto: 2350 },
      { nome: "Livello B1", netto: 1980 },
      { nome: "Livello C1", netto: 1720 },
      { nome: "Livello D1", netto: 1520 },
      { nome: "Livello E1", netto: 1380 },
    ],
  },
  {
    settore: "Commercio",
    livelli: [
      { nome: "Quadro", netto: 2450 },
      { nome: "Livello 1", netto: 2050 },
      { nome: "Livello 3", netto: 1650 },
      { nome: "Livello 4", netto: 1500 },
      { nome: "Livello 6", netto: 1330 },
    ],
  },
  {
    settore: "Metalmeccanico",
    livelli: [
      { nome: "Livello 7", netto: 2200 },
      { nome: "Livello 5", netto: 1850 },
      { nome: "Livello 3", netto: 1560 },
      { nome: "Livello 1", netto: 1400 },
    ],
  },
  {
    settore: "Turismo / Pubblici Esercizi",
    livelli: [
      { nome: "Livello 2", netto: 1900 },
      { nome: "Livello 4", netto: 1560 },
      { nome: "Livello 6S", netto: 1350 },
    ],
  },
];

/* ---------------------------------------------------------------------------
   2) CATEGORIE DI SPESA — nome + icona Lucide + classe colore del pallino
   Per aggiungere una categoria: copia una riga e cambia nome/icona/colore.
   ------------------------------------------------------------------------- */
const CATEGORIE = [
  { nome: "Alimentari", icona: ShoppingCart },
  { nome: "Casa e Bollette", icona: Home },
  { nome: "Trasporti", icona: Car },
  { nome: "Ristoranti", icona: Utensils },
  { nome: "Svago", icona: Film },
  { nome: "Salute", icona: HeartPulse },
];

/* ---------------------------------------------------------------------------
   3) DATI FINTI RESTITUITI DALL'OCR SIMULATO (scansione scontrino)
   Cambia qui esercente/importo/categoria di default.
   ------------------------------------------------------------------------- */
const OCR_RISULTATO_FINTO = {
  esercente: "Coop",
  importo: 34.5,
  categoria: "Alimentari",
};
const OCR_DURATA_MS = 2000; // durata dell'animazione "Analisi AI..." in millisecondi

/* ---------------------------------------------------------------------------
   4) TESTI DELL'ASSISTENTE AI (chat simulata)
   ------------------------------------------------------------------------- */
const TESTI_CHAT = {
  benvenuto:
    "Ciao! Sono il tuo assistente Freedom Runway. Chiedimi ad esempio: «Posso spendere 50€ al ristorante?» oppure «Come sta andando il mio budget?»",
  budgetNonImpostato:
    "Prima imposta le tue entrate mensili nella sezione «Entrate»: senza budget non riesco a fare i conti!",
};

/* ---------------------------------------------------------------------------
   5) TRANSAZIONI DI ESEMPIO iniziali (puoi svuotare l'array con [])
   ------------------------------------------------------------------------- */
const TRANSAZIONI_INIZIALI = [
  { id: 1, esercente: "Esselunga", importo: 62.3, categoria: "Alimentari", data: "2026-09-01" },
  { id: 2, esercente: "Bolletta Luce", importo: 78.9, categoria: "Casa e Bollette", data: "2026-09-02" },
];

/* ========================================================================== */

type Transazione = {
  id: number;
  esercente: string;
  importo: number;
  categoria: string;
  data: string;
};

type Messaggio = { id: number; autore: "utente" | "ai"; testo: string };

// Formatta un numero in euro (es. 1234.5 -> "1.234,50 €")
const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

// Restituisce l'icona associata a una categoria (fallback: carrello)
const iconaCategoria = (nome: string) =>
  CATEGORIE.find((c) => c.nome === nome)?.icona ?? ShoppingCart;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Freedom Runway — Budget mensile su misura del tuo stipendio" },
      {
        name: "description",
        content:
          "Gestisci il budget mensile partendo dallo stipendio CCNL, scansiona gli scontrini e chiedi consigli all'assistente AI.",
      },
      { property: "og:title", content: "Freedom Runway — Budget mensile intelligente" },
      {
        property: "og:description",
        content:
          "Imposta le entrate da CCNL o manualmente, registra le spese con l'OCR e monitora quanto ti resta ogni mese.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FreedomRunway,
});

function FreedomRunway() {
  /* ---------------- STATO GLOBALE DELL'APP ---------------- */
  const [modoEntrate, setModoEntrate] = useState<"manuale" | "ccnl">("manuale");
  const [nettoManuale, setNettoManuale] = useState<string>("");
  const [settore, setSettore] = useState<string>("");
  const [livello, setLivello] = useState<string>("");
  const [transazioni, setTransazioni] = useState<Transazione[]>(TRANSAZIONI_INIZIALI);

  // Budget mensile calcolato in base alla modalità scelta
  const budget = useMemo(() => {
    if (modoEntrate === "manuale") return parseFloat(nettoManuale) || 0;
    const s = CCNL.find((c) => c.settore === settore);
    return s?.livelli.find((l) => l.nome === livello)?.netto ?? 0;
  }, [modoEntrate, nettoManuale, settore, livello]);

  const speso = useMemo(
    () => transazioni.reduce((tot, t) => tot + t.importo, 0),
    [transazioni],
  );
  const residuo = Math.max(budget - speso, 0);
  const percentuale = budget > 0 ? Math.min((speso / budget) * 100, 100) : 0;

  const eliminaTransazione = (id: number) =>
    setTransazioni((prec) => prec.filter((t) => t.id !== id));

  const aggiungiTransazione = (t: Omit<Transazione, "id">) =>
    setTransazioni((prec) => [{ ...t, id: Date.now() }, ...prec]);

  return (
    /* <!-- INIZIO CONTENITORE PAGINA -->
       min-h-screen = altezza minima tutto schermo | bg-background = sfondo grigio-azzurro
       pb-10 = spazio in fondo | px-4 = margini laterali su mobile */
    <div className="min-h-screen bg-background px-4 pb-16 pt-6 sm:px-6">
      {/* mx-auto max-w-3xl = colonna centrata larga max 768px (mobile-first) */}
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {/* <!-- INIZIO HEADER / TITOLO APP -->
            grid-cols-[minmax(0,1fr)_auto] = titolo elastico + badge fisso a destra */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* quadrato con icona: h-11 w-11 = 44px, rounded-2xl = angoli molto arrotondati */}
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                Freedom Runway
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                Il tuo budget mensile, sempre sotto controllo
              </p>
            </div>
          </div>
          {/* badge con il budget attivo */}
          <span className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
            {budget > 0 ? euro(budget) : "Nessun budget"}
          </span>
        </header>
        {/* <!-- FINE HEADER --> */}

        <SezioneDashboard
          budget={budget}
          speso={speso}
          residuo={residuo}
          percentuale={percentuale}
        />

        <SezioneEntrate
          modoEntrate={modoEntrate}
          setModoEntrate={setModoEntrate}
          nettoManuale={nettoManuale}
          setNettoManuale={setNettoManuale}
          settore={settore}
          setSettore={setSettore}
          livello={livello}
          setLivello={setLivello}
        />

        <SezioneScanner onConferma={aggiungiTransazione} />

        <SezioneTransazioni transazioni={transazioni} onElimina={eliminaTransazione} />

        <SezioneChat budget={budget} speso={speso} residuo={residuo} />
      </div>
    </div>
  );
}

/* ==========================================================================
   CARD DASHBOARD — anello di avanzamento + numeri principali
   ========================================================================== */
function SezioneDashboard({
  budget,
  speso,
  residuo,
  percentuale,
}: {
  budget: number;
  speso: number;
  residuo: number;
  percentuale: number;
}) {
  // Calcolo matematico dell'anello SVG (raggio 52 -> circonferenza 2πr)
  const raggio = 52;
  const circonferenza = 2 * Math.PI * raggio;
  const offset = circonferenza - (percentuale / 100) * circonferenza;

  return (
    /* <!-- INIZIO CARD BILANCIO -->
       rounded-3xl = angoli molto arrotondati | bg-card = bianco | p-5 = padding interno
       shadow-sm = ombra leggera | border = bordo sottile grigio */
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      {/* flex-col su mobile, riga affiancata da sm: in su */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        {/* --- ANELLO DI AVANZAMENTO (SVG) --- */}
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            {/* cerchio di sfondo grigio */}
            <circle
              cx="60"
              cy="60"
              r={raggio}
              fill="none"
              strokeWidth="12"
              className="stroke-muted"
            />
            {/* cerchio colorato che indica la percentuale spesa */}
            <circle
              cx="60"
              cy="60"
              r={raggio}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circonferenza}
              strokeDashoffset={offset}
              className="stroke-primary transition-all duration-700"
            />
          </svg>
          {/* testo centrato dentro l'anello (absolute + inset-0 + grid place-items-center) */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(percentuale)}%</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                speso
              </p>
            </div>
          </div>
        </div>

        {/* --- NUMERI: entrate / spese / residuo --- */}
        <div className="grid w-full grid-cols-3 gap-3 text-center sm:text-left">
          <Numero etichetta="Entrate" valore={euro(budget)} />
          <Numero etichetta="Spese" valore={euro(speso)} />
          <Numero etichetta="Residuo" valore={euro(residuo)} evidenzia />
        </div>
      </div>

      {/* --- BARRA DI AVANZAMENTO in stile widget mobile --- */}
      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${percentuale}%` }}
        />
      </div>
    </section>
    /* <!-- FINE CARD BILANCIO --> */
  );
}

// Piccolo blocco numerico riutilizzato nella dashboard
function Numero({
  etichetta,
  valore,
  evidenzia,
}: {
  etichetta: string;
  valore: string;
  evidenzia?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {etichetta}
      </p>
      <p
        className={`truncate text-sm font-bold sm:text-base ${
          evidenzia ? "text-primary" : "text-foreground"
        }`}
      >
        {valore}
      </p>
    </div>
  );
}

/* ==========================================================================
   CARD ENTRATE — scelta tra inserimento manuale e selettore CCNL
   ========================================================================== */
function SezioneEntrate(props: {
  modoEntrate: "manuale" | "ccnl";
  setModoEntrate: (v: "manuale" | "ccnl") => void;
  nettoManuale: string;
  setNettoManuale: (v: string) => void;
  settore: string;
  setSettore: (v: string) => void;
  livello: string;
  setLivello: (v: string) => void;
}) {
  const {
    modoEntrate,
    setModoEntrate,
    nettoManuale,
    setNettoManuale,
    settore,
    setSettore,
    livello,
    setLivello,
  } = props;

  const livelliDisponibili =
    CCNL.find((c) => c.settore === settore)?.livelli ?? [];

  return (
    /* <!-- INIZIO CARD ENTRATE --> */
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <TitoloCard icona={Wallet} titolo="Entrate mensili" />

      {/* --- INTERRUTTORE A DUE PULSANTI (manuale / CCNL) ---
          bg-muted p-1 rounded-2xl = "pillola" contenitore; il bottone attivo diventa bianco */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        <button
          onClick={() => setModoEntrate("manuale")}
          className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            modoEntrate === "manuale"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Inserimento manuale
        </button>
        <button
          onClick={() => setModoEntrate("ccnl")}
          className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            modoEntrate === "ccnl"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Selettore CCNL
        </button>
      </div>

      {/* --- CAMPO MANUALE --- */}
      {modoEntrate === "manuale" && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Netto mensile in euro
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={nettoManuale}
            onChange={(e) => setNettoManuale(e.target.value)}
            placeholder="Es. 1600"
            /* w-full = larghezza piena | rounded-2xl = angoli | focus:ring-2 = alone al focus */
            className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* --- DUE MENU A TENDINA CCNL --- */}
      {modoEntrate === "ccnl" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Settore / CCNL
            </label>
            <select
              value={settore}
              onChange={(e) => {
                setSettore(e.target.value);
                setLivello(""); // azzera il livello quando cambia il settore
              }}
              className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Seleziona settore…</option>
              {CCNL.map((c) => (
                <option key={c.settore} value={c.settore}>
                  {c.settore}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Livello
            </label>
            <select
              value={livello}
              onChange={(e) => setLivello(e.target.value)}
              disabled={!settore}
              className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="">Seleziona livello…</option>
              {livelliDisponibili.map((l) => (
                <option key={l.nome} value={l.nome}>
                  {l.nome} — {euro(l.netto)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
    /* <!-- FINE CARD ENTRATE --> */
  );
}

/* ==========================================================================
   CARD SCANNER SCONTRINO (OCR SIMULATO)
   ========================================================================== */
function SezioneScanner({
  onConferma,
}: {
  onConferma: (t: Omit<Transazione, "id">) => void;
}) {
  const [analisi, setAnalisi] = useState(false); // true = animazione in corso
  const [form, setForm] = useState<Omit<Transazione, "id"> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  // Simula l'analisi AI: attende OCR_DURATA_MS e poi compila il form
  const avviaAnalisi = () => {
    setForm(null);
    setAnalisi(true);
    setTimeout(() => {
      setAnalisi(false);
      setForm({
        esercente: OCR_RISULTATO_FINTO.esercente,
        importo: OCR_RISULTATO_FINTO.importo,
        categoria: OCR_RISULTATO_FINTO.categoria,
        data: new Date().toISOString().slice(0, 10), // data di oggi
      });
    }, OCR_DURATA_MS);
  };

  return (
    /* <!-- INIZIO CARD SCANNER SCONTRINO --> */
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <TitoloCard icona={ScanLine} titolo="Carica scontrino" />

      {/* --- AREA DRAG & DROP ---
          border-dashed = bordo tratteggiato | cursor-pointer = manina del mouse */}
      <div
        onClick={() => inputFile.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          avviaAnalisi();
        }}
        className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-primary bg-accent/40" : "border-border bg-muted/40"
        }`}
      >
        <Upload className="mx-auto h-7 w-7 text-primary" />
        <p className="mt-2 text-sm font-medium">
          Trascina qui la foto dello scontrino
        </p>
        <p className="text-xs text-muted-foreground">oppure clicca per selezionarla</p>
        <input
          ref={inputFile}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() => avviaAnalisi()}
        />
      </div>

      {/* --- STATO DI CARICAMENTO (animazione 2 secondi) --- */}
      {analisi && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-accent/50 px-4 py-3">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <p className="text-sm font-medium">Analisi AI dello scontrino in corso…</p>
        </div>
      )}

      {/* --- FORM PRECOMPILATO CON I DATI "ESTRATTI" --- */}
      {form && (
        <div className="mt-4 rounded-2xl border bg-muted/30 p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Dati estratti automaticamente
          </p>
          {/* griglia 1 colonna su mobile, 2 colonne da sm: in su */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etichetta="Esercente">
              <input
                value={form.esercente}
                onChange={(e) => setForm({ ...form, esercente: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Campo>
            <Campo etichetta="Importo (€)">
              <input
                type="number"
                value={form.importo}
                onChange={(e) =>
                  setForm({ ...form, importo: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Campo>
            <Campo etichetta="Data">
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </Campo>
            <Campo etichetta="Categoria">
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIE.map((c) => (
                  <option key={c.nome} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          {/* pulsante principale: bg-primary = verde acqua, testo chiaro */}
          <button
            onClick={() => {
              onConferma(form);
              setForm(null);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <CheckCircle2 className="h-4 w-4" /> Conferma e registra spesa
          </button>
        </div>
      )}
    </section>
    /* <!-- FINE CARD SCANNER SCONTRINO --> */
  );
}

/* ==========================================================================
   CARD LISTA TRANSAZIONI
   ========================================================================== */
function SezioneTransazioni({
  transazioni,
  onElimina,
}: {
  transazioni: Transazione[];
  onElimina: (id: number) => void;
}) {
  return (
    /* <!-- INIZIO CARD TRANSAZIONI --> */
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <TitoloCard icona={Wallet} titolo="Ultime transazioni" />

      {transazioni.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nessuna spesa registrata: carica uno scontrino per iniziare.
        </p>
      ) : (
        /* divide-y = linea sottile di separazione tra le righe */
        <ul className="mt-3 divide-y">
          {transazioni.map((t) => {
            const Icona = iconaCategoria(t.categoria);
            return (
              /* riga: griglia [icona+testo elastico] + [importo e cestino fissi] */
              <li
                key={t.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icona className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.esercente}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.categoria} · {t.data}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold">-{euro(t.importo)}</span>
                  {/* pulsante elimina: hover:text-destructive = diventa rosso al passaggio */}
                  <button
                    aria-label={`Elimina ${t.esercente}`}
                    onClick={() => onElimina(t.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
    /* <!-- FINE CARD TRANSAZIONI --> */
  );
}

/* ==========================================================================
   CARD CHAT — assistente AI simulato che ragiona sul budget reale
   ========================================================================== */
function SezioneChat({
  budget,
  speso,
  residuo,
}: {
  budget: number;
  speso: number;
  residuo: number;
}) {
  const [messaggi, setMessaggi] = useState<Messaggio[]>([
    { id: 0, autore: "ai", testo: TESTI_CHAT.benvenuto },
  ]);
  const [testo, setTesto] = useState("");
  const [scrive, setScrive] = useState(false);

  // "Cervello" simulato: legge la domanda e costruisce la risposta sui numeri reali
  const rispostaAI = (domanda: string): string => {
    if (budget <= 0) return TESTI_CHAT.budgetNonImpostato;
    const percResidua = Math.round((residuo / budget) * 100);
    const importo = parseFloat(
      (domanda.match(/(\d+([.,]\d+)?)/)?.[1] ?? "").replace(",", "."),
    );

    // Caso 1: la domanda contiene un importo -> valuta se è sostenibile
    if (!isNaN(importo) && importo > 0) {
      if (importo > residuo)
        return `Attenzione: ti restano solo ${euro(residuo)} questo mese, quindi ${euro(
          importo,
        )} sforerebbero il budget. Ti consiglio di rimandare o ridurre la spesa.`;
      const dopo = Math.round(((residuo - importo) / budget) * 100);
      return `Sì, puoi permettertelo. Dopo una spesa di ${euro(
        importo,
      )} ti resterebbe ancora il ${dopo}% del budget mensile (${euro(residuo - importo)}).`;
    }

    // Caso 2: domanda generica sull'andamento del budget
    return `Al momento hai speso ${euro(speso)} su ${euro(
      budget,
    )}: ti rimane il ${percResidua}% del budget, cioè ${euro(residuo)}. ${
      percResidua < 25
        ? "Sei in zona rossa: meglio frenare le spese non essenziali."
        : "Stai andando bene, continua così!"
    }`;
  };

  const invia = () => {
    const domanda = testo.trim();
    if (!domanda) return;
    setMessaggi((p) => [...p, { id: Date.now(), autore: "utente", testo: domanda }]);
    setTesto("");
    setScrive(true);
    setTimeout(() => {
      setScrive(false);
      setMessaggi((p) => [
        ...p,
        { id: Date.now() + 1, autore: "ai", testo: rispostaAI(domanda) },
      ]);
    }, 900); // ritardo simulato della risposta AI
  };

  return (
    /* <!-- INIZIO CARD CHAT AI --> */
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <TitoloCard icona={Bot} titolo="AI Budget Assistant" />

      {/* area messaggi: max-h-72 + overflow-y-auto = scroll interno */}
      <div className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
        {messaggi.map((m) => (
          <div
            key={m.id}
            /* i messaggi utente si allineano a destra (self-end) */
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.autore === "utente"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-muted text-foreground"
            }`}
          >
            {m.testo}
          </div>
        ))}
        {scrive && (
          <div className="self-start rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
            L'assistente sta analizzando il tuo budget…
          </div>
        )}
      </div>

      {/* riga di input + pulsante invio */}
      <div className="mt-4 flex items-center gap-2">
        <input
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && invia()}
          placeholder="Posso spendere 50€ per un ristorante?"
          className="min-w-0 flex-1 rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={invia}
          aria-label="Invia messaggio"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
    /* <!-- FINE CARD CHAT AI --> */
  );
}

/* ==========================================================================
   COMPONENTI GRAFICI RIUTILIZZABILI (titolo card ed etichetta campo)
   ========================================================================== */
function TitoloCard({
  icona: Icona,
  titolo,
}: {
  icona: typeof Wallet;
  titolo: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icona className="h-4 w-4 shrink-0 text-primary" />
      <h2 className="truncate text-base font-semibold">{titolo}</h2>
    </div>
  );
}

function Campo({
  etichetta,
  children,
}: {
  etichetta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {etichetta}
      </label>
      {children}
    </div>
  );
}
