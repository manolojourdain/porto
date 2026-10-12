# Porto Trip

Application React issue du composant fourni, avec Vite et Tailwind CSS.

## Développement

Node.js 24 est utilisé dans l'environnement cloud (Vite nécessite Node.js 20.19+ ou 22.12+).

```sh
cd /workspace/porto
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run dev -- --port 5173 --strictPort
```

## Compilation

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Les favoris et les données de voyage sont conservés dans le localStorage du navigateur. Aucun serveur de données ni secret n'est requis. Les images utilisent images.unsplash.com ; la police optionnelle Inter utilise fonts.googleapis.com et fonts.gstatic.com. Leur chargement dépend de l'accès réseau. Les liens de cartes ouvrent Google Maps.

La déclaration du manifeste seule ne fournit pas de mode hors ligne : aucun service worker n'est fourni dans le composant.
