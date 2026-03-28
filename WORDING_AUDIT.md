# Wording Audit — DossierPrêt
**Cible :** primo-accédants 20–30 ans
**Ton cible :** direct, rassurant, accessible — "l'ami qui connaît le sujet"
**Statut :** ✅ = modifié · ➡️ = conservé (déjà bon)

---

## Page d'accueil (`src/pages/index.astro`)

### `<title>`
| Avant | Après | Statut |
|-------|-------|--------|
| `Diagnostic Prêt Immobilier Gratuit — DossierPrêt` | `Diagnostic prêt immobilier gratuit — Testez votre dossier \| DossierPrêt` | ✅ |
**Pourquoi :** Le mot-clé principal en premier, pipe standard, "Testez votre dossier" ajoute un signal d'intention transactionnelle.

---

### `<meta name="description">`
| Avant | Après | Statut |
|-------|-------|--------|
| "Analysez votre profil bancaire selon les critères HCSF en 30 secondes. Identifiez ce qui peut entraîner un refus de prêt immobilier et les leviers pour y remédier." | "Votre dossier de prêt immobilier peut-il être refusé ? Analysez votre profil en 2 minutes selon les critères bancaires. Gratuit, instantané, sans inscription." | ✅ |
**Pourquoi :** Commence par la douleur principale de la cible (question rhétorique), mentionne les 3 arguments de réassurance, supprime le jargon "HCSF".

---

### Hero — Sous-titre (`<p>`)
| Avant | Après | Statut |
|-------|-------|--------|
| "Analysez votre profil selon les critères bancaires standards. Identifiez précisément ce qui peut bloquer votre dossier — et comment y remédier." | "Testez votre profil en 2 minutes selon les critères des banques. Découvrez ce qui pourrait bloquer votre prêt immobilier — avant de déposer votre dossier." | ✅ |
**Pourquoi :** "Testez" est plus actif et plus concret que "Analysez". "Avant de déposer votre dossier" répond à la peur de se faire refuser.

---

### Hero — Badges de réassurance
| Avant | Après | Statut |
|-------|-------|--------|
| "Critères HCSF intégrés" | "Critères bancaires HCSF" | ✅ |
| "Méthodologie bancaire" | "Sans rendez-vous ni inscription" | ✅ |
| "Analyse impartiale" | "Résultat en 2 minutes" | ✅ |
**Pourquoi :** "Méthodologie bancaire" est du jargon professionnel sans valeur perçue pour un primo-accédant. Remplacé par des promesses concrètes (délai, accessibilité) qui répondent directement aux freins de la cible.

---

### Section "Ce que vous obtenez" — H2
| Avant | Après | Statut |
|-------|-------|--------|
| "Diagnostic professionnel complet" | "Ce que vous découvrez en 2 minutes" | ✅ |
**Pourquoi :** "Professionnel" peut intimider. "Ce que vous découvrez en 2 minutes" met l'accent sur le bénéfice immédiat.

---

### Section "Ce que vous obtenez" — sous-texte
| Avant | Après | Statut |
|-------|-------|--------|
| "Basé sur les mêmes critères utilisés par les établissements bancaires pour évaluer votre dossier." | "Tout ce qu'une banque regarde quand elle analyse votre dossier de prêt immobilier." | ✅ |
**Pourquoi :** Plus concret, moins institutionnel. Intègre le mot-clé "dossier de prêt immobilier".

---

### Feature card 1
| Avant | Après | Statut |
|-------|-------|--------|
| Titre : "Analyse DMP" | Titre : "Votre taux d'endettement décortiqué" | ✅ |
| Desc : "Taux d'endettement, reste à vivre, stabilité des revenus — les 3 axes clés évalués par les banques." | Desc : "Taux d'endettement, reste à vivre, stabilité des revenus : vous savez exactement où vous en êtes face aux critères des banques." | ✅ |
**Pourquoi :** "Analyse DMP" est un acronyme opaque. Le nouveau titre nomme le bénéfice clé (taux d'endettement = critère n°1 de refus).

---

### Feature card 2
| Avant | Après | Statut |
|-------|-------|--------|
| Titre : "Pas de pub" | Titre : "Zéro conflit d'intérêts" | ✅ |
| Desc : conservée | Desc : "Aucun partenariat bancaire, aucune revente de données. Votre diagnostic reste confidentiel et impartial." | ✅ |
**Pourquoi :** "Zéro conflit d'intérêts" exprime le bénéfice (fiabilité, impartialité) plutôt qu'une absence (pas de pub).

---

### Feature card 3
| Avant | Après | Statut |
|-------|-------|--------|
| Titre : "Simulation optimisée" | Titre : "Des actions concrètes, pas juste un score" | ✅ |
| Desc : "Identifiez les leviers d'amélioration concrets pour renforcer votre dossier avant de déposer une demande." | Desc : "On vous dit exactement quoi corriger — et dans quel ordre — pour améliorer vos chances avant de déposer votre dossier de prêt." | ✅ |
**Pourquoi :** "Simulation optimisée" est vague. Le nouveau wording met en avant la différence vs les outils concurrents qui ne donnent qu'un score.

---

### Section "Comment ça marche" — label
| Avant | Après | Statut |
|-------|-------|--------|
| "Processus" | "Comment ça marche" | ✅ |
**Pourquoi :** "Processus" est du jargon professionnel. "Comment ça marche" est naturel et rassurant.

---

### Section "Comment ça marche" — H2
| Avant | Après | Statut |
|-------|-------|--------|
| "Comment analyser votre dossier prêt immobilier ?" | "Votre diagnostic prêt immobilier en 3 étapes" | ✅ |
**Pourquoi :** Conserve le mot-clé SEO, reformule en promesse concrète (3 étapes = simple).

---

### Section "Comment ça marche" — sous-texte
| Avant | Après | Statut |
|-------|-------|--------|
| "Trois étapes pour comprendre et améliorer votre situation." | "2 minutes suffisent pour savoir si votre profil emprunteur tient la route." | ✅ |
**Pourquoi :** Concret, intègre le délai promis et "profil emprunteur" (cluster sémantique cible).

---

### Étape 1
| Avant | Après | Statut |
|-------|-------|--------|
| "Renseignez vos données" / "Aucune donnée personnelle collectée." | "Renseignez vos chiffres" / "On ne vous demande pas votre nom — juste vos chiffres." | ✅ |
**Pourquoi :** Répond à la peur de la surveillance / collecte de données avec une formule mémorable.

---

### Étape 2
| Avant | Après | Statut |
|-------|-------|--------|
| "Obtenez votre diagnostic" / "Notre moteur analyse votre profil selon les critères HCSF et les pratiques bancaires actuelles." | "Recevez votre diagnostic" / "Notre analyse compare votre profil aux critères réels utilisés par les banques pour accepter ou refuser un prêt immobilier." | ✅ |
**Pourquoi :** "Recevez" renforce la notion de livraison active. "Accepter ou refuser" nomme explicitement la douleur principale.

---

### Étape 3
| Avant | Après | Statut |
|-------|-------|--------|
| "Agissez sur les leviers" / "Chaque risque identifié est accompagné d'une explication claire et d'actions concrètes." | Titre : conservé / "Chaque point de blocage identifié vient avec une explication claire et des actions concrètes pour corriger votre dossier." | ✅ |
**Pourquoi :** "Point de blocage" est plus concret que "risque". "Corriger votre dossier" répond au besoin.

---

### CTA Banner — H2
| Avant | Après | Statut |
|-------|-------|--------|
| "Prêt à optimiser votre dossier ?" | "Envie de savoir si votre banque va dire oui ?" | ✅ |
**Pourquoi :** "Optimiser" est trop technique et vague. La reformulation nomme directement la question que se pose chaque primo-accédant.

---

### CTA Banner — sous-texte
| Avant | Après | Statut |
|-------|-------|--------|
| "Obtenez une analyse complète et personnalisée. Maximisez vos chances d'acceptation bancaire." | "Obtenez une analyse complète de votre profil emprunteur. Sans rendez-vous, sans engagement." | ✅ |
**Pourquoi :** "Maximisez vos chances d'acceptation" fait une promesse de résultat implicite. Le nouveau wording reste factuel et intègre deux arguments de friction zéro.

---

### CTA Banner — bouton
| Avant | Après | Statut |
|-------|-------|--------|
| "Démarrer mon diagnostic Premium" | "Voir l'analyse complète de mon dossier" | ✅ |
**Pourquoi :** Orienté bénéfice (voir l'analyse) plutôt que produit (démarrer un diagnostic).

---

## Page Premium (`src/pages/premium.astro`)

### `<title>`
| Avant | Après | Statut |
|-------|-------|--------|
| "Analyse Complète Dossier Prêt Immobilier — DossierPrêt" | "Conseils personnalisés pour votre prêt immobilier — DossierPrêt Premium" | ✅ |

---

### `<meta name="description">`
| Avant | Après | Statut |
|-------|-------|--------|
| "Obtenez une analyse approfondie de votre profil emprunteur selon les critères HCSF. Identification des risques de refus, plan d'action prioritaire et simulations personnalisées." | "Obtenez un plan d'action personnalisé pour votre dossier de prêt immobilier. Identifiez ce qui peut bloquer votre prêt et comment y remédier. Accès immédiat, à partir de 16€." | ✅ |
**Pourquoi :** Ajoute le prix (signal d'intention transactionnelle), supprime le jargon "HCSF" du snippet.

---

### Hero — badge
| Avant | Après | Statut |
|-------|-------|--------|
| "Diagnostic personnalisé" | "Analyse complète · Plan d'action" | ✅ |

---

### Hero — H1
| Avant | Après | Statut |
|-------|-------|--------|
| "Analyse complète de votre dossier bancaire" | "Sachez exactement pourquoi votre banque pourrait refuser votre prêt" | ✅ |
**Pourquoi :** Le titre précédent était un titre-produit. Le nouveau est orienté résultat et répond à la douleur principale.

---

### Hero — sous-titre
| Avant | Après | Statut |
|-------|-------|--------|
| "Analyse complète de votre dossier bancaire — plan d'action prioritaire inclus." *(doublon exact du H1)* | "Un rapport détaillé avec les blocages identifiés et les actions concrètes pour améliorer votre dossier — avant de déposer." | ✅ |
**Pourquoi :** Le sous-titre était une copie mot-à-mot du H1. Corrigé et reformulé pour ajouter de la valeur.

---

### Features section — H2
| Avant | Après | Statut |
|-------|-------|--------|
| "Ce qui est inclus dans le Premium" | "Ce que vous obtenez avec le Premium" | ✅ |

---

### Features section — sous-texte
| Avant | Après | Statut |
|-------|-------|--------|
| "Un diagnostic complet pour identifier vos chances d'acceptation bancaire." | "Tout ce qu'il faut pour déposer votre dossier de prêt immobilier en sachant exactement où vous en êtes." | ✅ |

---

### Feature 1
| Avant | Après | Statut |
|-------|-------|--------|
| "Analyse complète à titre HCSF" | "Analyse ligne par ligne de votre profil" | ✅ |

---

### Feature 2
| Avant | Après | Statut |
|-------|-------|--------|
| "Identification précise des signaux de risque" | "On vous dit exactement ce qui peut bloquer" | ✅ |

---

### Feature 3
| Avant | Après | Statut |
|-------|-------|--------|
| "Plan d'action priorité" | "Un plan d'action clair et priorisé" | ✅ |

---

### Feature 4
| Avant | Après | Statut |
|-------|-------|--------|
| "Simulations d'amortisation (optionnel)" | "Simulations selon votre situation" | ✅ |

---

### Feature 5
| Avant | Après | Statut |
|-------|-------|--------|
| "Très confidentiel" | "Vos données restent les vôtres" | ✅ |

---

### Feature 6
| Avant | Après | Statut |
|-------|-------|--------|
| "Aucun impact sur votre banque" | "Invisible pour votre banque" | ✅ |

---

### FAQ — Question 2
| Avant | Après | Statut |
|-------|-------|--------|
| "Avez-vous accès à mes données bancaires ?" | "Est-ce que vous voyez mes informations bancaires ?" | ✅ |
**Pourquoi :** Formulation plus naturelle, moins juridique.

---

### FAQ — Question 4 (réponse)
| Avant | Après | Statut |
|-------|-------|--------|
| "Le plan Premium est un accès unique par rapport." *(phrase tronquée)* | "Le plan Premium est un accès unique. Il n'y a pas d'abonnement pour ce plan. Le plan Pro peut être annulé à tout moment depuis votre espace client." | ✅ |

---

### CTA Banner — H2
| Avant | Après | Statut |
|-------|-------|--------|
| "Prêt à optimiser votre dossier ?" | "Obtenez votre analyse complète maintenant" | ✅ |

---

### CTA Banner — sous-texte
| Avant | Après | Statut |
|-------|-------|--------|
| "Obtenez votre analyse complète et personnalisée. Maximisez vos chances d'acceptation bancaire." | "Un rapport complet sur votre profil emprunteur, des actions concrètes pour l'améliorer, un accès immédiat." | ✅ |

---

### CTA Banner — bouton
| Avant | Après | Statut |
|-------|-------|--------|
| "Démarrer mon diagnostic Premium" | "Accéder à mon diagnostic complet" | ✅ |

---

### CTA Banner — ligne de réassurance *(ajout)*
| Avant | Après | Statut |
|-------|-------|--------|
| *(absent)* | "Paiement sécurisé · Accès immédiat · Sans abonnement" | ✅ |

---

## Composant PricingToggle (`src/components/PricingToggle.svelte`)

### Plan Express — description
| Avant | Après | Statut |
|-------|-------|--------|
| "Diagnostic rapide, gratuit" | "Gratuit · Sans inscription" | ✅ |

### Plan Express — CTA
| Avant | Après | Statut |
|-------|-------|--------|
| "Lancer l'analyse" | "Tester mon dossier gratuitement" | ✅ |

### Plan Premium — CTA
| Avant | Après | Statut |
|-------|-------|--------|
| "Démarrer mon diagnostic →" | "Obtenir mon analyse complète →" | ✅ |

### Plan Premium — features
| Avant | Après | Statut |
|-------|-------|--------|
| "Analyse approfondie ligne par ligne" | "Analyse détaillée de chaque critère bancaire" | ✅ |
| "Identification précise des blocages" | "Les blocages identifiés et classés par priorité" | ✅ |
| "Plan d'action personnalisé" | "Plan d'action concret pour corriger votre dossier" | ✅ |
| "Simulations d'amortisation" | "Simulations selon vos scénarios" | ✅ |

---

## Layout BlogPost (`src/layouts/BlogPost.astro`)

### CTA fin d'article — bouton
| Avant | Après | Statut |
|-------|-------|--------|
| "Lancer l'analyse gratuite" | "Tester mon dossier gratuitement" | ✅ |
**Pourquoi :** Cohérence avec les CTA de la page d'accueil. Formulation orientée action de l'utilisateur.

---

## Éléments conservés intentionnellement

| Élément | Raison |
|---------|--------|
| H1 page d'accueil : "Votre dossier peut-il être refusé par la banque ?" | Déjà optimal — question directe, mot-clé présent, correspond à la douleur principale |
| Trust bullets : Gratuit / Instantané / Sans engagement / Données privées | Clairs, concis, efficaces |
| Disclaimer légal : "Outil d'information pédagogique — Aucune garantie..." | Obligation réglementaire — à conserver |
| Titres des articles blog | SEO déjà bien optimisé, contenu pertinent |
| Stats section premium : 35% / 25 ans / 10% | Données factuelles utiles comme preuve sociale |
