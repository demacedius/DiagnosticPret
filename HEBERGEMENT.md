# DossierPrêt — Récapitulatif technique pour choix d'hébergement

## 1. Description du projet

SaaS français d'analyse de dossier emprunteur immobilier.
Permet aux particuliers d'évaluer les risques de refus de prêt bancaire, d'obtenir un plan d'action personnalisé et des simulations d'amortissement.

---

## 2. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Astro | 5.17 |
| UI Components | Svelte | 5.51 |
| CSS | Tailwind CSS | 4.1 |
| Blog | MDX | via @astrojs/mdx |
| Auth | Clerk | @clerk/astro 2.17 |
| Paiement | Stripe | 20.3 |
| Runtime | Node.js | ≥ 18 |
| Adaptateur | @astrojs/node (standalone) | 9.5 |

---

## 3. Mode de rendu — point critique pour l'hébergement

```
output: 'server'
adapter: node({ mode: 'standalone' })
```

**Ce que ça signifie :**
- L'application compile en un **serveur Node.js autonome** (`dist/server/entry.mjs`)
- Il faut un **processus Node.js persistant** (pas serverless)
- La commande de démarrage est : `node dist/server/entry.mjs`
- Le port est configurable via la variable d'environnement `PORT`

> ⚠️ **Incompatible en l'état** avec : Vercel (serverless), Netlify Functions, Cloudflare Pages.
> Ces plateformes nécessiteraient de changer l'adaptateur.

---

## 4. Pages et routes

### Pages publiques (accessibles sans compte)
| Route | Description |
|---|---|
| `/` | Page d'accueil + simulateur express gratuit |
| `/premium` | Page de présentation + tarifs |
| `/blog` | Liste des articles |
| `/blog/[slug]` | Article individuel (5 articles MDX) |
| `/connexion` | Formulaire de connexion Clerk |
| `/inscription` | Formulaire d'inscription Clerk |
| `/mentions-legales` | Mentions légales |
| `/politique-confidentialite` | Politique de confidentialité |
| `/cgu` | Conditions générales d'utilisation |
| `/404` | Page d'erreur |

### Pages protégées (nécessitent une connexion)
| Route | Protection | Description |
|---|---|---|
| `/dashboard` | Clerk auth | Espace personnel utilisateur |
| `/diagnostic` | Clerk auth + plan Premium/Pro | Diagnostic complet (formulaire + résultats + export PDF) |
| `/compte` | Clerk auth | (Réservé pour profil/paramètres) |

### API routes
| Route | Méthode | Description |
|---|---|---|
| `/api/webhooks/stripe` | POST | Réception des événements Stripe après paiement |

---

## 5. Fonctionnalités détaillées

### 5.1 Simulateur express (gratuit, page d'accueil)
- Formulaire 4 champs : revenus, charges, apport, découvert
- Calcul instantané côté client (Svelte)
- Affichage des risques identifiés
- CTA vers le diagnostic complet

### 5.2 Diagnostic complet Premium
- Formulaire 10 champs (revenus, charges, montant emprunté, durée, taux, apport, contrat, ancienneté, découvert, enfants)
- **Score global /100** (5 critères : emploi, taux endettement, apport, comportement bancaire, reste à vivre)
- **Vérification conformité HCSF** (taux ≤ 35 %, durée ≤ 25 ans)
- **Plan d'action personnalisé** : items classés Bloquant / Important / Conseil avec explications
- **Tableau de simulations** : 4 scénarios de taux (3,5 / 4,0 / 4,5 / 5,0 %) — mensualité, coût total, taux d'endettement
- **Export PDF** via `window.print()` + CSS @media print

### 5.3 Authentification (Clerk)
- Inscription / connexion via Clerk (composants natifs)
- Middleware de protection des routes `/dashboard` et `/diagnostic`
- `Astro.locals.auth()` pour vérification côté serveur
- `UserButton` dans la navbar (avatar + menu déconnexion)

### 5.4 Gestion des abonnements (Stripe)
- Plans : **Premium** et **Pro**
- Paiement via Stripe Payment Links
- Webhook `checkout.session.completed` → met à jour `publicMetadata.plan` dans Clerk
- Gate dans `/diagnostic` : si `plan === 'free'` → redirect `/premium?upgrade=1`
- Bandeau orange sur `/premium` quand redirigé depuis diagnostic

### 5.5 Blog (MDX)
- 5 articles optimisés SEO
- Rendu côté serveur avec Astro Content Collections
- Sitemap auto-généré

### 5.6 Dark mode
- Toggle persistant (localStorage)
- Anti-flash script inline dans `<head>`
- Classes `dark:` Tailwind sur tous les composants

---

## 6. Base de données — situation actuelle et évolution prévue

### Situation actuelle (MVP)
- **Aucune base de données** requise pour l'instant
- Les utilisateurs et leurs plans (Premium/Pro) sont stockés dans **Clerk** (`publicMetadata`)
- Les paiements sont gérés entièrement par **Stripe**

### Évolution prévue (phase suivante)
Une base de données sera nécessaire pour les fonctionnalités futures :

| Fonctionnalité | Besoin |
|---|---|
| Sauvegarde des diagnostics utilisateurs | Table `diagnostics` |
| Dashboard courtier (plan Pro) | Table `clients`, `dossiers` |
| Historique des analyses | Table `analyses` |
| Export multi-dossiers | Requêtes agrégées |

**Base de données envisagée : PostgreSQL**
- Soit via **Supabase** (service managé, plan gratuit généreux)
- Soit via la base de données managée proposée par l'hébergeur

> L'hébergeur idéal devrait proposer **PostgreSQL managé** ou permettre d'y connecter un service externe (Supabase).

---

## 7. Variables d'environnement requises

```env
# Clerk (authentification)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Stripe (paiement)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...          # Optionnel

# Base de données (future)
DATABASE_URL=postgresql://...       # À ajouter lors de l'intégration BDD

# Port (optionnel, défaut 4321)
PORT=3000
```

Toutes les variables `STRIPE_*` et `CLERK_SECRET_KEY` ne transitent **jamais** côté client.

---

## 8. Processus de build et de démarrage

```bash
# Installation des dépendances
npm install

# Build de production
npm run build
# → génère dist/ avec dist/server/entry.mjs

# Démarrage du serveur
node dist/server/entry.mjs
# ou avec port custom :
PORT=3000 node dist/server/entry.mjs
```

---

## 9. Ressources nécessaires (estimation)

| Ressource | Besoin |
|---|---|
| RAM | ~256 MB minimum (512 MB recommandé) |
| CPU | 1 vCPU suffisant (trafic modéré) |
| Disque | ~200 MB (build + dépendances) |
| Bande passante | Faible (pas de vidéo, pas d'images lourdes) |
| Base de données | Aucune maintenant — PostgreSQL à prévoir |
| Stockage fichiers | Aucun (pas d'upload utilisateur) |
| Process persistant | **Oui** — processus Node.js long-running |

---

## 10. Contraintes spécifiques pour l'hébergeur

1. **Node.js ≥ 18** requis
2. **Processus persistant** (pas de serverless pur)
3. **Variables d'environnement** configurables via dashboard
4. **HTTPS obligatoire** (Clerk requiert HTTPS en production)
5. **Webhook Stripe** : l'URL `/api/webhooks/stripe` doit être accessible publiquement
6. **Domaine custom** : dossierpret.fr doit pointer sur le serveur
7. **Redémarrage automatique** en cas de crash (PM2, systemd, ou natif de la plateforme)
8. **PostgreSQL managé ou externe** (pour la phase suivante)
9. **Conformité RGPD** : données hébergées en Europe (idéalement France ou Suisse)

---

## 11. Analyse détaillée — Infomaniak vs Hostinger

### 🟢 Infomaniak

**Profil :** Hébergeur suisse, 100 % énergie renouvelable, très axé RGPD/confidentialité.

| Critère | Détail |
|---|---|
| **Node.js standalone** | ✅ Via Cloud Elastic (Jelastic) — containers Node.js persistants |
| **PostgreSQL managé** | ✅ Inclus dans certains plans Cloud |
| **HTTPS + domaine custom** | ✅ Certificats Let's Encrypt automatiques |
| **Variables d'environnement** | ✅ Configurables dans l'interface Jelastic |
| **Datacenter** | 🇨🇭 Suisse — conformité RGPD maximale |
| **Webhook accessible** | ✅ IP publique fixe |
| **Prix estimé** | ~10–20 €/mois (Cloud Elastic) |
| **Déploiement** | Manuel ou via Git (Jelastic supporte Git deploy) |
| **Support** | Français, réactif |

**Pour DossierPrêt :**
- Plan **Cloud Elastic** (Jelastic) : parfait pour un serveur Node.js standalone
- Base PostgreSQL managée disponible directement
- Idéal si la conformité RGPD et le datacenter européen sont prioritaires
- Interface plus technique mais bien documentée

---

### 🟡 Hostinger

**Profil :** Hébergeur lituanien, très agressif sur les prix, grand public.

| Critère | Détail |
|---|---|
| **Node.js standalone** | ⚠️ VPS uniquement (hébergement mutualisé = PHP only) |
| **PostgreSQL managé** | ⚠️ MySQL inclus, PostgreSQL via VPS seulement |
| **HTTPS + domaine custom** | ✅ Certificats Let's Encrypt automatiques |
| **Variables d'environnement** | ✅ Via fichier `.env` sur VPS (SSH) |
| **Datacenter** | 🇪🇺 EU disponible (LT, NL, UK) — pas France ni Suisse |
| **Webhook accessible** | ✅ IP publique sur VPS |
| **Prix estimé** | ~5–8 €/mois (VPS KVM 1) |
| **Déploiement** | SSH + script manuel, ou GitHub Actions |
| **Support** | Chat 24/7, qualité variable |

**Pour DossierPrêt :**
- Le **VPS KVM 1** (1 vCPU, 4 GB RAM, ~5 €/mois) est suffisant pour le lancement
- Nécessite de configurer manuellement PM2 pour le process persistant
- PostgreSQL disponible en l'installant soi-même sur le VPS (ou via Supabase externe)
- Prix très attractif mais plus de configuration manuelle

---

### Comparatif synthèse

| Critère | Infomaniak | Hostinger VPS |
|---|---|---|
| Node.js standalone | ✅ Natif (Jelastic) | ✅ Manuelle (VPS) |
| PostgreSQL managé | ✅ Inclus | ⚠️ À installer |
| RGPD / Datacenter EU | ✅ Suisse | ⚠️ Lituanie/NL |
| Facilité de déploiement | ✅ Interface graphique | ⚠️ SSH manuel |
| Prix | ~15–20 €/mois | ~5–8 €/mois |
| Support francophone | ✅ Oui | ⚠️ Partiel |
| Scalabilité | ✅ Auto-scaling Jelastic | ⚠️ Upgrade VPS |

---

## 12. Autres plateformes compatibles (pour comparaison)

### ✅ Node standalone, sans configuration
| Plateforme | Prix | Notes |
|---|---|---|
| **Railway** | ~5 $/mois | Déploiement Git en 2 clics, PostgreSQL inclus |
| **Render** | 0–7 $/mois | Free tier (sleep après 15 min d'inactivité) |
| **Fly.io** | ~3–10 $/mois | Datacenter Paris disponible |

### ⚠️ Nécessitent de changer l'adaptateur Astro
| Plateforme | Changement |
|---|---|
| Vercel | `@astrojs/vercel` |
| Netlify | `@astrojs/netlify` |
| Cloudflare Pages | `@astrojs/cloudflare` |

### ❌ Incompatibles
- Hébergements mutualisés PHP (OVH WebHosting, Hostinger Shared, etc.)
- GitHub Pages (statique uniquement)

---

## 13. Recommandation synthèse pour ChatGPT

> Projet Astro v5 SSR avec adaptateur Node.js standalone (processus persistant requis).
> Auth via Clerk (SaaS externe). Paiement Stripe avec webhook POST.
> Pas de base de données pour le MVP — PostgreSQL prévu pour la phase suivante (sauvegarde diagnostics, dashboard courtier Pro).
> Audience France, conformité RGPD importante, budget MVP minimal.
> Trafic initial faible (lancement), scalabilité nécessaire ensuite.
> Deux hébergeurs préférés à analyser : **Infomaniak** (Cloud Elastic/Jelastic) et **Hostinger** (VPS KVM).
> Critères de décision : support Node.js standalone, PostgreSQL managé disponible, datacenter européen, prix, facilité de déploiement.
