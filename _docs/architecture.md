```
graphql/
├── index.html
├── profile.html
│
├── js/
│   ├── app.js	(pilote principal de l'app, gestion login/token)
│   ├── profile.js	(génére le dashboard global)
│	│
│   ├── api/
│   │   ├── graphql-request.js	(fonction générique de requête à l'API)
│   │   ├── user.js	(traite les infos utilisateur)
│   │   ├── xp.js	(traite les scores xp)
│   │   ├── progress.js	(progression)
│   │   └── audit.js	(ratio d'audit)
│	│
│   └── graphs/	(crée les graphiques SVG)
│      ├── 1-xp-timeline.js
│      ├── 2-pass-fail.js
│      └── 3-xp-by-project.js
│
├── css/
│  ├── index.css
│  ├── profile.css
│  └── fonts.css
│
├── fonts/
│
└── img/
```