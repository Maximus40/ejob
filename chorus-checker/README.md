# Chorus Checker

Outil de validation et diagnostic des flux de facturation publique française pour les établissements de santé (CH, EPSM, EHPAD) et éditeurs de logiciels.

## Fonctionnalités

- **Validation préventive** : analysez vos fichiers XML PES V2, CHORUS Pro UBL/CII et CSV avant envoi
- **Diagnostic d'erreurs** : identifiez la cause et la correction de tout code rejet
- **IA embarquée** : diagnostic expert en temps réel via Claude (Anthropic)
- **Base de connaissance** : capitalisation des cas résolus, partagée entre établissements
- **Alertes Enovacom** : réception et analyse automatique des alertes en temps réel
- **Multi-tenant** : isolation complète des données par organisation (RLS Supabase)

## Stack technique

- **Frontend** : Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + RLS + Realtime + Storage)
- **IA** : Anthropic Claude (streaming SSE)
- **Charts** : Recharts

## Installation locale

```bash
git clone <repo>
cd chorus-checker
npm install
```

Remplir `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Exécuter les migrations SQL dans Supabase > SQL Editor (001 à 008), puis :

```bash
npm run dev
```

## Architecture

```
chorus-checker/
├── app/
│   ├── (auth)/          # Login / Signup
│   ├── (dashboard)/     # Interface principale protégée
│   └── api/             # Routes API (analyze, diagnose, webhook)
├── components/
│   ├── analysis/        # Upload, résultats, IA
│   ├── dashboard/       # Métriques, graphiques, alertes
│   ├── knowledge/       # Base de connaissance
│   └── layout/          # Sidebar, topbar
├── lib/
│   ├── supabase/        # Clients browser/server/middleware
│   ├── anthropic/       # Client + prompts système
│   └── parsers/         # Parsers PES V2, CHORUS UBL, CSV
└── supabase/
    └── migrations/      # Schéma SQL + seed
```

## Licence

Propriétaire — Usage réservé aux établissements de santé partenaires.
