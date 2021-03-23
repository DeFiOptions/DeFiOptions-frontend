# DeFiOptions Vue.js front-end

GH Pages: https://DeFiOptions.github.io/DeFiOptions-frontend/ 

### Install npm packages

```bash
npm install
```

### Run the web app

```bash
npm run serve
```

(Make sure your network is set to Kovan.)

### Deploy to GitHub Pages

```bash
npm run build

cd dist/

git init

git add -A

git commit -m "deployment to GH Pages"

git push -f git@github.com:DeFiOptions/DeFiOptions-frontend.git master:gh-pages
```
