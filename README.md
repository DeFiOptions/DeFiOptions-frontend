# DeFiOptions web3 app

Accessible via: https://DeFiOptions.org 

## IMPORTANT!

Do not edit `gh-pages` or `master` branch directly!

Development should be done on the `develop` branch (or sub-branches). When you want to deploy to production, 
merge the `develop` branch into the `master` branch and GitHub Actions will automatically build the app and 
deploy it to GitHub Pages.

## Local development

### Install npm packages

```bash
npm install
```

### Run the web app

```bash
npm run serve
```

(Make sure your network is set to Kovan or Polygon.)
