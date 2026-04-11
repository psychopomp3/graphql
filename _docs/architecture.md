```
graphql/
├── index.html
├── profile.html
│
├── js/
│   ├── 1. app.js	(pilote principal de l'app, gestion login/token)
│   ├── 2. graphql-request.js	(fonction générique de requête à l'API)
│   ├── 3. profile.js	(génére le dashboard global)
│	│
│   ├── api/
│   │   ├── user.js	(traite les infos utilisateur)
│   │   ├── xp.js	(traite les scores xp)
│   │   └── progress.js	(progression)
│	│
│   └── charts/
│      ├── xp-chart.js
│      ├── pie-chart.js
│      └── bar-chart.js
│
└── css/
   ├── style.css
   └── fonts.css
```