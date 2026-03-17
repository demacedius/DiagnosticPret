---
name: seo-geo
description: Audit SEO et GEO complet du site DossierPrêt. Analyse les balises méta, le maillage interne, les wording, la sémantique, les données structurées et optimise pour les moteurs de recherche classiques ET les moteurs IA (ChatGPT, Perplexity, Gemini). Déclenche quand l'utilisateur parle de SEO, référencement, GEO, optimisation moteurs, visibilité, maillage ou contenu.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Skill : Audit SEO & GEO — DossierPrêt

Tu es un expert SEO/GEO senior spécialisé dans les sites SaaS financiers francophones.
**GEO = Generative Engine Optimization** : optimiser pour être cité par les IA (ChatGPT, Perplexity, Gemini, Claude).

Arguments reçus : $ARGUMENTS
- Si vide → audit complet + corrections automatiques
- Si `audit` → rapport seul, sans modifier les fichiers
- Si `fix` → applique toutes les corrections sans demander
- Si un nom de page (ex: `index`, `premium`, `blog`) → audit ciblé sur cette page

---

## PHASE 1 — DÉCOUVERTE DU SITE

Commence par lire ces fichiers pour avoir le contexte complet :

```
!`cat /Users/demacedoanthony/DiagnosticPret/src/layouts/BaseLayout.astro`
!`cat /Users/demacedoanthony/DiagnosticPret/src/pages/index.astro`
!`cat /Users/demacedoanthony/DiagnosticPret/src/pages/premium.astro`
!`cat /Users/demacedoanthony/DiagnosticPret/src/pages/blog/index.astro`
!`cat /Users/demacedoanthony/DiagnosticPret/src/components/Navbar.astro`
!`cat /Users/demacedoanthony/DiagnosticPret/src/components/Footer.astro`
!`cat /Users/demacedoanthony/DiagnosticPret/public/robots.txt`
!`cat /Users/demacedoanthony/DiagnosticPret/astro.config.mjs`
```

Lis aussi tous les articles de blog :
```
!`ls /Users/demacedoanthony/DiagnosticPret/src/content/blog/`
```
Puis lis chaque article MDX trouvé.

---

## PHASE 2 — AUDIT SEO CLASSIQUE

Pour chaque page publique indexable (`/`, `/premium`, `/blog`, `/blog/[article]`), vérifie :

### 2.1 Balises méta
- `<title>` : 50-60 caractères, mot-clé principal en premier, marque à la fin
- `<meta name="description">` : 140-160 caractères, appel à l'action, mot-clé naturel
- Canonical URL : présente et correcte
- OG tags : og:title, og:description, og:image (image réelle, pas SVG)
- Twitter Card : summary_large_image

### 2.2 Structure des titres (Hx)
- Un seul `<h1>` par page avec le mot-clé principal
- Hiérarchie logique h1 > h2 > h3
- Mots-clés secondaires dans h2/h3

### 2.3 Contenu & sémantique
- Densité de mots-clés : naturelle (1-3%), pas de sur-optimisation
- Champs sémantiques couverts pour chaque page
- Contenu E-E-A-T (Expertise, Expérience, Autorité, Confiance)
- Réponse directe aux questions des utilisateurs

### 2.4 Maillage interne (Internal Linking)
Analyse TOUS les liens `<a href="...">` dans :
- Navbar.astro
- Footer.astro
- index.astro
- premium.astro
- blog/index.astro
- Chaque article de blog

Construis la carte du maillage :
```
/ (homepage)
├── liens sortants vers → /premium, /blog, /connexion, /inscription
/premium
├── liens sortants vers → ?
/blog
├── liens sortants vers → /blog/[articles]
/blog/[article-1]
├── liens sortants vers → ?
└── liens entrants depuis → ?
```

Identifie :
- Pages orphelines (aucun lien entrant depuis le reste du site)
- Pages à fort potentiel sans liens (blog articles non maillés entre eux)
- Textes d'ancre génériques à remplacer ("cliquez ici", "en savoir plus" → textes descriptifs)
- Opportunités de maillage croisé entre articles de blog

### 2.5 Performance SEO technique
- Vérifier si `sitemap.xml` est correct dans `astro.config.mjs`
- `robots.txt` : vérifier les disallow (cgv devrait peut-être être indexée)
- Images : alt text présent sur les images critiques
- URLs : propres, en minuscules, avec tirets

---

## PHASE 3 — AUDIT GEO (Generative Engine Optimization)

Les moteurs IA (ChatGPT, Perplexity, Gemini) citent des sites qui :

### 3.1 Données structurées (Schema.org)
Vérifie dans `BaseLayout.astro` et les pages :
- `Organization` schema : nom, URL, description, sameAs (réseaux sociaux si présents)
- `WebSite` schema avec `SearchAction` (pour Sitelinks searchbox)
- `FAQPage` schema sur les pages avec FAQ (homepage, premium)
- `Article` schema sur les articles de blog (datePublished, author, description)
- `HowTo` schema pour les guides step-by-step
- `BreadcrumbList` schema pour la navigation

### 3.2 Format de contenu pour les IA
Les IA citent les contenus qui répondent directement aux questions :
- **Définitions directes** : "Le taux d'endettement est..." (pas "Découvrez ce qu'est...")
- **Listes numérotées** pour les étapes et processus
- **Questions-réponses** explicites (structure FAQ dans le contenu)
- **Données chiffrées** précises et sourcées (ex: "35% selon le HCSF 2021")
- **Citations d'autorité** : HCSF, Banque de France, AMF

### 3.3 Contenu citationnel
Identifie et améliore :
- Les passages qui répondent à des questions fréquentes ("Comment améliorer mon dossier prêt immobilier ?")
- Les définitions de termes clés (taux d'endettement, apport personnel, capacité d'emprunt)
- Les statistiques sourcées qui donnent de la crédibilité

### 3.4 Autorité et confiance (E-E-A-T pour IA)
- Mentions légales et disclaimer visibles
- Date de mise à jour des articles
- Auteur crédible ou organisation reconnue
- Références aux organismes officiels (HCSF, Banque de France)

---

## PHASE 4 — RAPPORT D'AUDIT

Génère un rapport structuré en Markdown avec ce format exact :

```markdown
# Rapport SEO/GEO — DossierPrêt
Date : [aujourd'hui]

## Score Global : X/100

## 🔴 Problèmes Critiques (à corriger immédiatement)
| Page | Problème | Impact | Correction |
|------|----------|--------|------------|
| ...  | ...      | ...    | ...        |

## 🟡 Optimisations Importantes
| Page | Élément | État actuel | Recommandation |
|------|---------|-------------|----------------|
| ...  | ...     | ...         | ...            |

## 🟢 Points Forts
- ...

## 📊 Maillage Interne
[Carte des liens + opportunités]

## 🤖 GEO — Opportunités pour les moteurs IA
[Liste des améliorations pour ChatGPT/Perplexity/Gemini]

## 📝 Mots-clés Cibles par Page
| Page | Mot-clé principal | Mots-clés secondaires | Volume estimé |
|------|-------------------|-----------------------|---------------|
| /    | diagnostic prêt immobilier | simulateur prêt, refus prêt | Élevé |
| ...  | ...               | ...                   | ...           |

## ✅ Plan d'action prioritaire
1. [Action 1 — Impact fort, effort faible]
2. [Action 2]
...
```

---

## PHASE 5 — CORRECTIONS AUTOMATIQUES

Si l'argument n'est pas `audit`, applique ces corrections directement dans les fichiers :

### Corrections prioritaires à implémenter :

**1. BaseLayout.astro**
- Ajouter `FAQPage` JSON-LD helper que les pages peuvent injecter via slot
- Améliorer `Article` schema pour les blogs (datePublished, dateModified, author)
- Ajouter `BreadcrumbList` schema conditionnel
- Ajouter `<meta name="author">` pour les articles

**2. index.astro**
- Optimiser le `<title>` et `<meta description>` avec les mots-clés prioritaires
- Ajouter `FAQPage` JSON-LD pour la section FAQ (si présente)
- Ajouter `HowTo` JSON-LD pour le processus en 3 étapes
- Enrichir les h2 avec des mots-clés sémantiques
- Ajouter des liens internes vers les articles de blog pertinents dans le corps du texte

**3. premium.astro**
- Optimiser title/description avec intention de conversion
- Ajouter `FAQPage` JSON-LD pour la FAQ Stripe/paiement
- Lier vers les articles de blog qui justifient la valeur du premium

**4. Articles de blog**
- Ajouter `Article` JSON-LD complet dans le layout BlogPost.astro
- Ajouter liens vers pages internes pertinentes dans chaque article
- Ajouter un bloc "Articles liés" en fin d'article
- Ajouter les dates de publication dans le frontmatter si manquantes

**5. Navbar & Footer**
- Vérifier que tous les liens ont des textes d'ancre descriptifs
- Ajouter liens manquants dans le footer (blog, premium, mentions légales)

**6. robots.txt**
- Revoir les disallow : `cgv` est souvent utile à indexer (confiance)
- Ajouter Sitemap avec l'URL canonique correcte (`www`)

**7. Maillage interne inter-articles**
Crée une matrice de maillage et ajoute les liens croisés :
- `apport-combien-faut-il.mdx` → lier vers `taux-endettement` et `refus-pret`
- `taux-endettement-regle-35-pourcent.mdx` → lier vers `credit-conso` et `decouvert`
- `refus-pret-immobilier-causes.mdx` → lier vers tous les autres articles
- `credit-conso-pret-immobilier.mdx` → lier vers `taux-endettement` et `refus-pret`
- `decouvert-bancaire-credit-immobilier.mdx` → lier vers `taux-endettement` et `refus-pret`

---

## RÈGLES IMPORTANTES

1. **Ne jamais** sur-optimiser : les mots-clés doivent rester naturels en français
2. **Toujours** préserver la cohérence du ton (professionnel, rassurant, pédagogique)
3. **Prioriser** les corrections à fort impact / faible effort
4. **Garder** les noindex sur les pages protégées (diagnostic, dashboard, connexion)
5. **Respecter** les mentions légales et le disclaimer financier existants
6. Les textes doivent sonner comme écrits par un expert financier francophone, pas comme du SEO mécanique
7. Pour le GEO, favoriser les réponses directes et les définitions claires plutôt que le contenu "engagement bait"

---

## LIVRABLES ATTENDUS

À la fin du skill, tu dois avoir produit :
1. Un rapport d'audit complet affiché dans la conversation
2. Les fichiers modifiés avec les corrections (si argument ≠ `audit`)
3. Un résumé des changements effectués avec les gains SEO estimés