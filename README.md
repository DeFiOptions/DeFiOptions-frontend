# DeFiOptions web3 app

Accessible via: https://DeFiOptions.org

### Install npm packages

```bash
npm install
```

### Run the web app

```bash
npm run serve
```

(Make sure your network is set to Kovan or Polygon.)

### Deploy to GitHub Pages

Do not edit the `gh-pages` branch. Instead edit the `master` branch and then run the commands below to deploy to GH Pages:

```bash
npm run build

cd dist/

git init

git add -A

git commit -m "deployment to GH Pages"

git push -f git@github.com:DeFiOptions/DeFiOptions-frontend.git master:gh-pages
```
