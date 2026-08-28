# 🔎 Mordle

Et norskspråklig mordmysterium i nettleseren, inspirert av [Murdle](https://murdle.com).
Spilles på [mordle.damsleth.no](https://mordle.damsleth.no).
Tre mistenkte, tre våpen, tre steder – og nøyaktig én løsning. Bruk ledetrådene,
fyll ut etterforskningstavla og avslør morderen.

Bygget som ren HTML/CSS/JS uten byggetrinn, servert som statiske assets fra en
Cloudflare Worker. Full PWA-støtte: legg den til på hjemskjermen på iOS/Android
og spill offline.

## Slik spiller du

- Hver mistenkt befant seg på sitt eget sted, og hvert våpen lå på sitt eget sted.
- Morderen er den som var på åstedet – med våpenet som lå der.
- Trykk i rutenettet: **✗** = umulig, **✓** = bekreftet. En ✓ krysser automatisk
  ut resten av raden og kolonnen i blokken.
- Når du vet hvem, hva og hvor: **Anklag!**

Hver sak genereres tilfeldig med garantert unik løsning (en innebygd løser
verifiserer og minimerer ledetrådene). Saker kan deles via lenke – seedet ligger
i URL-en (`#sak=…`), så mottakeren får nøyaktig samme gåte.

## Kjør lokalt

```bash
npm install
npm run dev        # wrangler dev → http://localhost:8787
npm test           # verifiserer at genererte saker har unik løsning
```

## Deploy til Cloudflare

Manuelt:

```bash
npx wrangler login
npm run deploy
```

Automatisk (samme oppsett som blog.damsleth.no):

- `deploy-worker.yml` – tester og deployer ved push til `main`
- `deploy-worker-preview.yml` – deployer PR-er til `mordle-preview` på
  workers.dev og kommenterer preview-URL-en på PR-en

Begge krever repository secrets `CLOUDFLARE_API_TOKEN` (med *Workers Scripts:
Edit*) og `CLOUDFLARE_ACCOUNT_ID`.

## Struktur

```
public/          # alt som serveres – ingen byggetrinn
  index.html
  style.css      # mørkt detektivtema, mobil først
  app.js         # UI og spilltilstand
  game.js        # generator + løser (deles med testene)
  sw.js          # service worker (offline)
  manifest.webmanifest
  icons/
tests/           # node --test
wrangler.jsonc   # assets-only Worker
```
