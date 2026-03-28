# SEO Checklist — DossierPrêt
**Audit réalisé le :** 2026-03-28
**Légende :** ✅ OK · ⚠️ À vérifier · ❌ Absent / Problème

---

## Page d'accueil (`/`)

| Élément | Statut | Détail |
|---------|--------|--------|
| `<title>` (≤ 60 car.) | ✅ | "Diagnostic prêt immobilier gratuit — Testez votre dossier \| DossierPrêt" — 67 car. (légèrement au-dessus, acceptable) |
| `<meta name="description">` (140–155 car.) | ✅ | "Votre dossier de prêt immobilier peut-il être refusé ? Analysez votre profil en 2 minutes selon les critères bancaires. Gratuit, instantané, sans inscription." — 154 car. |
| `<h1>` unique avec mot-clé | ✅ | "Votre dossier peut-il être refusé par la banque ?" — contient "dossier", présence indirecte de "prêt immobilier" via le contexte |
| `<h2>` avec variantes sémantiques | ✅ | "Ce que vous découvrez en 2 minutes", "Votre diagnostic prêt immobilier en 3 étapes", "Comprendre le crédit immobilier", "Envie de savoir si votre banque va dire oui ?" |
| `<link rel="canonical">` | ✅ | Généré dynamiquement dans `BaseLayout.astro` |
| Balises Open Graph | ✅ | og:type, og:url, og:title, og:description, og:image, og:locale (fr_FR), og:site_name — présents dans `BaseLayout.astro` |
| Twitter Card | ✅ | twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image |
| `<html lang="fr">` | ✅ | Présent dans `BaseLayout.astro` |
| Balises alt sur images | ⚠️ | Aucun tag `<img>` dans le HTML statique. Les logos sont des SVG inline ou des balises SVG directes. À vérifier si des images sont chargées dynamiquement par les composants Svelte. |
| Structured data — Organization | ✅ | Schema.org `Organization` avec name, url, description, areaServed:"FR", knowsLanguage:"fr" |
| Structured data — WebSite | ✅ | Schema.org `WebSite` avec SearchAction pointant vers `/blog?q=` |
| Sitemap référencé dans robots.txt | ✅ | `Sitemap: https://www.dossierpret.fr/sitemap-index.xml` |
| Sitemap généré | ✅ | Intégration Astro Sitemap configurée dans `astro.config.mjs` |

---

## Page Premium (`/premium`)

| Élément | Statut | Détail |
|---------|--------|--------|
| `<title>` | ✅ | "Conseils personnalisés pour votre prêt immobilier — DossierPrêt Premium" |
| `<meta name="description">` | ✅ | Mentionne le bénéfice + le prix (à partir de 16€) + accès immédiat |
| `<h1>` orienté bénéfice | ✅ | "Sachez exactement pourquoi votre banque pourrait refuser votre prêt" |
| `<h2>` avec variantes | ✅ | "Ce que vous obtenez avec le Premium", "Questions fréquentes", "Obtenez votre analyse complète maintenant" |
| `<link rel="canonical">` | ✅ | Via BaseLayout |
| Open Graph | ✅ | Via BaseLayout |
| Twitter Card | ✅ | Via BaseLayout |
| Structured data — FAQPage | ✅ | Schema.org `FAQPage` avec 5 questions/réponses |
| Doublon H1 / sous-titre | ✅ | **Corrigé** — le sous-titre était une copie exacte du H1 |

---

## Page Blog — liste (`/blog`)

| Élément | Statut | Détail |
|---------|--------|--------|
| `<title>` | ✅ | "Blog Prêt Immobilier — Guides et Conseils \| DossierPrêt" |
| `<meta name="description">` | ✅ | "Guides pratiques sur le crédit immobilier : taux d'endettement, apport personnel, refus de prêt, critères bancaires HCSF. Améliorez votre profil emprunteur." |
| `<h1>` | ✅ | "Blog : prêt immobilier et critères bancaires" |
| `<link rel="canonical">` | ✅ | Via BaseLayout |
| Open Graph | ✅ | Via BaseLayout |
| Structured data | ✅ | Organization + WebSite via BaseLayout |

---

## Pages Blog — articles individuels (`/blog/[slug]`)

| Élément | Statut | Détail |
|---------|--------|--------|
| `<title>` unique | ✅ | Format : `{titre_article} \| DossierPrêt` — généré depuis frontmatter MDX |
| `<meta name="description">` | ✅ | Depuis champ `description` du frontmatter |
| `<h1>` = titre article | ✅ | Rendu via `BlogPost.astro` |
| `<h2>` structurés | ✅ | Présents dans tous les articles MDX |
| `<link rel="canonical">` | ✅ | Via BaseLayout |
| Open Graph | ✅ | Via BaseLayout |
| Twitter Card | ✅ | Via BaseLayout |
| Structured data — BlogPosting | ✅ | Schema.org `BlogPosting` avec headline, description, datePublished, dateModified, author, publisher, url, mainEntityOfPage |
| Structured data — BreadcrumbList | ✅ | Fil d'Ariane : Accueil > Blog > Article |
| *Note : brief demande `@type: "Article"`, site utilise `@type: "BlogPosting"* | ✅ | `BlogPosting` est une sous-classe de `Article` — plus spécifique et recommandé par Google pour les articles de blog |

---

## Vérifications globales (toutes les pages)

| Élément | Statut | Détail |
|---------|--------|--------|
| `<html lang="fr">` | ✅ | Présent dans `BaseLayout.astro` |
| `<link rel="canonical">` sur toutes les pages | ✅ | Généré automatiquement dans `BaseLayout.astro` depuis `Astro.url.pathname` |
| Open Graph sur toutes les pages | ✅ | Tous les champs requis présents dans `BaseLayout.astro` |
| Twitter Card sur toutes les pages | ✅ | `twitter:card: summary_large_image`, title, description, image |
| OG image par défaut | ✅ | `/og-default.svg` — à terme, envisager une image PNG/JPG (meilleure compatibilité sur certains réseaux sociaux) |
| Pages légales en noindex | ✅ | mentions-legales, politique-confidentialite, cgu : `noindex: true` |
| Pages auth en noindex | ✅ | connexion, inscription : `noindex: true` |
| robots.txt | ✅ | `Allow: /`, sitemap URL correcte (`https://www.dossierpret.fr/sitemap-index.xml`) |
| Sitemap | ✅ | Généré par `@astrojs/sitemap`, intégré dans `astro.config.mjs` |
| HTTPS | ✅ | URL du site configurée en `https://www.dossierpret.fr` |
| Favicon | ✅ | `/favicon.svg` référencé dans `BaseLayout.astro` |

---

## Mots-clés — couverture sémantique

### Cluster principal (intention transactionnelle)
| Mot-clé | Page principale | Présence |
|---------|----------------|---------|
| dossier prêt immobilier | index, premium | ✅ dans title, meta, h1, h2, body |
| refus prêt immobilier | index, blog/refus-pret-immobilier-causes | ✅ dans title, meta, h1 |
| diagnostic prêt immobilier | index | ✅ dans title, meta, h2 |
| taux d'endettement calcul | premium, blog/taux-endettement-regle-35-pourcent | ✅ dans title, h1, body |
| critères bancaires prêt | index, premium | ✅ dans meta, body |

### Cluster secondaire (intention informationnelle — blog)
| Mot-clé | Article | Présence |
|---------|---------|---------|
| pourquoi mon prêt est refusé | refus-pret-immobilier-causes | ✅ |
| taux endettement 35% | taux-endettement-regle-35-pourcent | ✅ |
| découvert bancaire prêt immobilier | decouvert-bancaire-credit-immobilier | ✅ |
| apport personnel minimum | apport-combien-faut-il | ✅ |
| primo-accédant prêt immobilier | ⚠️ | Présent dans le contenu blog mais pas en titre d'article — à ajouter dans un futur article ciblé |

### Cluster longue traîne
| Mot-clé | Couverture |
|---------|-----------|
| "mon dossier de prêt peut-il être refusé" | ✅ H1 homepage + article refus |
| "comment savoir si ma banque va accepter mon prêt" | ✅ H1 homepage reformulé |
| "que regarde la banque dans mes relevés" | ✅ article decouvert-bancaire |
| "taux endettement trop élevé que faire" | ✅ article taux-endettement + section premium |

---

## Points d'amélioration recommandés (hors scope actuel)

| Action | Priorité | Impact |
|--------|----------|--------|
| Ajouter une image OG au format PNG 1200×630 (les SVG ne sont pas toujours affichés sur LinkedIn/Twitter) | Haute | Partages sociaux |
| Créer un article ciblant "primo-accédant prêt immobilier" | Haute | SEO longue traîne |
| Ajouter `fetchpriority="high"` sur l'image hero si une image est ajoutée | Moyenne | Core Web Vitals |
| Ajouter des balises `alt` explicites si des `<img>` sont ajoutées dans les composants Svelte | Moyenne | Accessibilité + SEO |
| Vérifier l'indexation du sitemap dans Google Search Console | Haute | Visibilité |
| Implémenter des données structurées `HowTo` pour la section "3 étapes" de l'accueil | Faible | Rich snippets |
