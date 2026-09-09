# 🔎 Mordle

Et norskspråklig mordmysterium i nettleseren, inspirert av [Murdle](https://murdle.com).
Spilles på [mordle.damsleth.no](https://mordle.damsleth.no).
Tre (eller fire) mistenkte, våpen og steder – og nøyaktig én løsning. Bruk
ledetrådene, fyll ut etterforskningstavla og avslør morderen.

Bygget som ren HTML/CSS/JS uten byggetrinn, servert som statiske assets fra en
Cloudflare Worker. Full PWA-støtte: legg den til på hjemskjermen på iOS/Android
og spill offline.

## Slik spiller du

- Hver mistenkt befant seg på sitt eget sted, og hvert våpen lå på sitt eget sted.
- Morderen er den som var på åstedet – med våpenet som lå der.
- Trykk i rutenettet: **✗** = umulig, **✓** = bekreftet. En ✓ krysser automatisk
  ut resten av raden og kolonnen i blokken.
- Sitter du fast: **💡 Hint** avslører én rute (teller mot «perfekt»-status).
- Når du vet hvem, hva og hvor: **Anklag!**

### Nivåer og dagens sak

| Nivå | Størrelse | Ledetråder |
|------|-----------|------------|
| Lett | 3×3 | mest direkte observasjoner |
| Middels | 3×3 | flere utelukkelser |
| Vanskelig | 4×4 | enten/eller, kjennetegn («den som var i biblioteket bruker briller») |

**Dagens sak** er samme middels-sak for alle den dagen (seed = dato), med streak i
statistikken. Statistikken viser også de siste oppklarte sakene, som kan spilles
igjen eller deles.

Hver sak genereres tilfeldig med garantert unik løsning (en innebygd løser
verifiserer og minimerer ledetrådene). Saker kan deles via lenke – seedet ligger
i URL-en: `#sak=1234` (middels), `#sak=1234&niva=vanskelig` eller `#sak=dagens`.

## Kjør lokalt

```bash
npm install
npm run dev        # wrangler dev → http://localhost:8787
npm test           # verifiserer unik løsning og minimale ledetråder per nivå
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
  game.js        # generator + løser, nivåer og innhold (deles med testene)
  sw.js          # service worker (offline)
  manifest.webmanifest
  icons/
tests/           # node --test
wrangler.jsonc   # assets-only Worker
```
