# ProjektFlow

Kevytyrittäjän hallintaalusta — projektit, tuntiseuranta, matkat, kulut, laskutus ja AI-apuri.

## Ominaisuudet

- Projektinhallinta ja statusseuranta
- Työajan seuranta ajastimella
- Matkakirjaukset ja korvaukset
- Kulukirjaukset kategorioittain
- Kuitti- ja tositearkisto kuvilla
- Laskutus PDF-viennillä ja ALV-laskurilla
- Verotusyhteenveto ja CSV-vienti
- AI-apuri projektianalyysiä varten
- PWA — asennettavissa puhelimen kotinäytölle
- Tumma/vaalea teema

## Teknologiat

- [Next.js 16](https://nextjs.org/) — App Router
- [Supabase](https://supabase.com/) — tietokanta, autentikointi ja tiedostosäilytys
- [Anthropic Claude](https://anthropic.com/) — AI-apuri

## Asennus

```bash
npm install
```

Kopioi `.env.example` → `.env.local` ja täytä arvot:

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

## Ympäristömuuttujat

Katso `.env.example` — tarvitset Supabase- ja Anthropic-avaimet.
