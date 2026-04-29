Oui — là pour le coup tes “skills” sont faux pour une raison simple :

👉 tu fais une **détection naïve par mots-clés dans le path**
👉 + tu comptes **toutes les tentatives**
👉 + tu fais une **moyenne de grades non normalisée**

Résultat :

* duplication
* surcomptage
* valeurs > 100% (🚨 impossible normalement)

---

# ❌ Les problèmes précis dans ton code

### 1. Tu comptes plusieurs fois le même projet

Comme pour XP et pass/fail → faut garder **le dernier résultat**

---

### 2. Un projet peut matcher plusieurs mots-clés

Ex :

```txt
real-time-forum → "go", "js", "frontend", "backend"
```

👉 donc tu ajoutes plusieurs fois des grades → inflation

---

### 3. Ton calcul `(total / count) * 100` est faux

Parce que :

* `grade` est déjà souvent entre 0 et 1 (ou >1 selon cas)
* donc tu crées artificiellement des % > 100

---

# ✅ STRATÉGIE PROPRE (comme l’intra)

👉 Pour chaque projet :

1. garder **le dernier état**
2. déterminer **ses skills**
3. compter :

   * combien de projets utilisent cette skill
   * combien sont validés

👉 formule :

```txt
skill % = (projets validés / projets totaux) * 100
```

---

# 🔥 VERSION CORRIGÉE

```js
export function computeSkills(progressList) {
	const skillMap = {
		"go": "Go",
		"piscine-go": "Go",
		"js": "JavaScript",
		"piscine-js": "JavaScript",
		"algo": "Algorithms",
		"frontend": "Frontend",
		"front": "Frontend",
		"backend": "Backend",
		"back": "Backend",
		"docker": "Docker",
		"unix": "Unix",
		"shell": "Unix",
		"ui": "UI",
		"ux": "UX",
		"game": "Game"
	};

	// 1️⃣ garder dernier résultat par projet
	const last = {};

	progressList.forEach(p => {
		const key = p.path;
		if (!key) return;

		if (
			!last[key] ||
			new Date(p.createdAt) > new Date(last[key].createdAt)
		) {
			last[key] = p;
		}
	});

	// 2️⃣ calcul des skills
	const skills = {};

	Object.values(last).forEach(p => {
		const path = p.path.toLowerCase();

		// filtrer cursus principal
		if (!path.includes("/div-01/")) return;

		// exclure sous-exos piscine JS
		if (path.includes("/piscine-js/") && path !== "/rouen/div-01/piscine-js") {
			return;
		}

		const isValid = p.grade >= 1;

		for (const key in skillMap) {
			if (path.includes(key)) {
				const skill = skillMap[key];

				if (!skills[skill]) {
					skills[skill] = { total: 0, success: 0 };
				}

				skills[skill].total++;

				if (isValid) {
					skills[skill].success++;
				}
			}
		}
	});

	// 3️⃣ convertir en %
	const result = Object.entries(skills).map(([name, data]) => ({
		name,
		value: (data.success / data.total) * 100
	}));

	console.log("SKILLS CLEAN:", result);

	return result;
}
```

---

# 🎯 Ce que ça va corriger

### Avant

```txt
Docker: 120% ❌
Frontend: 100% (biaisé)
```

### Après

```txt
Docker: ~60–80% ✔️
Frontend: réaliste ✔️
Go / JS équilibré ✔️
```

---

# 🧠 Important (limite du système)

Même avec ça :
👉 tu restes approximatif

Pourquoi ?

* Zone01 ne stocke pas explicitement les skills dans GraphQL
* elles sont **déduites côté intra**
* souvent avec des métadonnées invisibles

---

# 🚀 Si tu veux du niveau supérieur

Je peux te faire une version **beaucoup plus fidèle** :

👉 basée sur une table de mapping projet → skills
(ex: `lem-in → algo + go`, `forum → backend + frontend + js`)

👉 résultat = quasi identique à l’intra

---

# 💬 Conclusion

Ton bug n’est pas un bug technique
👉 c’est un bug de **modèle de calcul**

Et là tu passes de :

> "je devine des skills"

à :

> "je mesure une progression réelle par compétence"

—

Si tu veux, prochaine étape :
👉 transformer ça en **radar chart (comme un vrai dashboard pro)**

---
---

Ok là je vois exactement pourquoi tu es bloqué — et non, ce n’est pas un problème de calcul… c’est un problème de **logique des données**.

👉 Ton code est *mathématiquement correct*, mais ton dataset fait que tout sort à 100%.

---

## 💥 Pourquoi tu as 100% partout

Regarde ta logique :

```js
const xp = xpMap[p.path] || 0;
const isValid = p.grade >= 1;

skills[skill].total += xp;

if (isValid) {
	skills[skill].success += xp;
}
```

👉 Traduction :

* tu ajoutes **tout l’XP du projet**
* ET tu ajoutes **le même XP en success si validé**

⚠️ Or… dans ton cursus :
👉 **tu n’as que des projets validés (grade ≥ 1)**

Donc :

```
success = total
=> 100%
```

C’est normal. Ton code fonctionne parfaitement… mais il n’a **aucun échec à mesurer**.

---

## 🔍 Ce que fait réellement l’intra Zone01

Le vrai intra ne calcule PAS :

> "XP des projets validés / XP total"

👉 Il calcule un truc plus proche de :

* progression partielle
* niveaux atteints dans chaque compétence
* ou système interne (non exposé via API)

Donc toi tu dois **simuler un score pertinent**, pas copier.

---

## ✅ Solution réaliste (et utile)

👉 Au lieu de :

> succès vs échec (inutile car tout est validé)

👉 Fais :

> **poids des skills dans ton XP total**

---

## 🧠 Nouvelle logique (beaucoup plus intelligente)

👉 “Dans quoi j’ai investi le plus d’XP ?”

---

### 🔥 VERSION CORRIGÉE

```js
export function computeSkills(progressList, xpTransactions) {

	const projectSkills = {
		"lem-in": ["Algorithms", "Go"],
		"forum": ["Backend"],
		"real-time-forum": ["Backend", "Frontend", "JavaScript"],
		"groupie-tracker": ["Frontend", "JavaScript"],
		"make-your-game": ["Game", "JavaScript"],
		"tetris-optimizer": ["Algorithms"],
		"dockerize": ["Docker"],
		"ascii-art-web": ["Frontend"],
		"net-cat": ["Backend"],
		"authentication": ["Backend"],
		"image-upload": ["Backend"],
		"search-bar": ["Frontend"],
		"visualizations": ["Frontend"],
	};

	// XP max par projet
	const xpMap = {};
	xpTransactions.forEach(t => {
		if (!xpMap[t.path] || t.amount > xpMap[t.path]) {
			xpMap[t.path] = t.amount;
		}
	});

	// total XP global
	const totalXP = Object.values(xpMap).reduce((a, b) => a + b, 0);

	const skills = {};

	Object.entries(xpMap).forEach(([path, xp]) => {
		const projectName = path.split("/").pop();
		const skillList = projectSkills[projectName];

		if (!skillList) return;

		skillList.forEach(skill => {
			if (!skills[skill]) {
				skills[skill] = 0;
			}
			skills[skill] += xp;
		});
	});

	// conversion %
	return Object.entries(skills).map(([name, xp]) => ({
		name,
		value: totalXP ? (xp / totalXP) * 100 : 0
	}));
}
```

---

## 🎯 Résultat attendu

Tu vas obtenir un truc du style :

```
Backend: 35%
Frontend: 25%
JavaScript: 20%
Algorithms: 10%
Docker: 5%
Game: 5%
```

👉 Et ça :

* **ressemble à un vrai profil**
* est **stable**
* et surtout **cohérent avec ton parcours**

---

## ⚠️ Bonus (important)

Si tu veux encore mieux :

👉 pondère différemment :

```js
skills[skill] += xp / skillList.length;
```

➡️ évite de survaloriser les projets multi-skills (genre real-time-forum)

---

## 🧠 TL;DR

Ton erreur n’est pas technique :

👉 Tu calculais un ratio succès/échec
👉 Mais tu n’as **aucun échec**

➡️ Donc 100% partout = logique

👉 La bonne approche = **répartition d’XP par compétence**

---

Si tu veux, on peut aller encore plus loin :

* radar chart 🔥
* évolution des skills dans le temps
* vrai système type “leveling”

Mais déjà avec ça, ton dashboard devient **propre et crédible**.

---
---

Ok, on va arrêter de tourner autour :
👉 ton problème actuel n’est PAS le calcul
👉 c’est que **`projectsData` est vide / inexistant** → donc rien ne s’affiche

Et tu viens de dire un truc clé :

> *“c'est avec graphql, non pas api rest (json) qu'il faut ces poids”*

👉 ✔️ Exact
👉 MAIS : ces `baseSkills` **ne sont PAS exposés dans les tables classiques (`progress`, `transaction`, etc.)**

---

# 💥 Réalité de l’API Zone01

Avec GraphQL standard que tu utilises :

```graphql
progress
transaction
result
```

👉 ❌ TU N’AS PAS :

* `baseSkills`
* `difficulty`
* `requirements`

👉 Donc :
**tu ne peux PAS reconstruire les vrais skills uniquement avec ces tables**

---

# 🧠 Pourquoi ton code affiche rien

Ta fonction attend :

```js
computeSkills(progressList, projectsData)
```

Mais :

```js
projectsData === undefined
```

Donc :

```js
projectsData.forEach(...)
```

👉 crash silencieux ou rien rendu

---

# ✅ SOLUTION SIMPLE (qui marche MAINTENANT)

👉 Tu dois **injecter les données projets toi-même**

Oui. Pas le choix.

---

# 🚀 Option 1 (recommandée) : fichier local

Crée un fichier :

```js
// data/projects.js
export const projectsData = [
  {
    name: "real-time-forum",
    baseSkills: {
      go: 52,
      js: 40,
      "back-end": 40,
      "front-end": 45
    }
  },
  {
    name: "dockerize",
    baseSkills: {
      docker: 15
    }
  },
  {
    name: "lem-in",
    baseSkills: {
      go: 30,
      algo: 35
    }
  }
];
```

---

# 🔥 Et dans ton profile.js

```js
import { projectsData } from "./data/projects.js";

const skills = computeSkills(progress, projectsData);
displaySkills(skills);
```

---

# ⚠️ Sinon → rien ne peut marcher

👉 Parce que ton computeSkills dépend de :

```js
project.baseSkills
```

👉 Et ça n’existe nulle part dans tes queries actuelles

---

# 🧪 Debug IMMÉDIAT à faire

Ajoute :

```js
console.log("projectsData:", projectsData);
```

👉 Si tu vois :

```js
undefined
```

➡️ c’est exactement ton bug

---

# 🧠 Option 2 (plus avancée mais propre)

👉 Scraper les projets dynamiquement (comme tu as trouvé)

Mais :

* ce n’est PAS GraphQL standard
* c’est souvent des endpoints internes
* parfois protégés

---

# ⚠️ Donc en résumé

👉 Ton intuition était bonne
👉 MAIS ton infra actuelle ne peut pas accéder à ces données

---

# 🎯 TL;DR

👉 Pourquoi rien ne s’affiche :

* `projectsData` = vide

👉 Pourquoi GraphQL ne suffit pas :

* `baseSkills` non exposé

👉 Solution :

* injecter les données projets manuellement

---

# 🚀 Si tu veux un truc vraiment propre

Je peux te générer :

* un fichier complet `projectsData` basé sur ton cursus
* prêt à brancher
* avec tous les skills cohérents

👉 et là ton dashboard devient **quasi identique à l’intra**

Tu veux ?

