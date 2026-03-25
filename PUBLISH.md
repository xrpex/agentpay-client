# Publishing agentpay-client to npm

## Step 1 — Create npm account
Go to https://npmjs.com → Sign Up → verify email

## Step 2 — Create GitHub repo
Create: github.com/xrpex/agentpay-client
Push all files from this folder to it

## Step 3 — Install dependencies
cd agentpay-client
npm install

## Step 4 — Build
npm run build
# Generates /dist folder with compiled JS + types

## Step 5 — Login to npm
npm login
# Enter your npm username, password, email

## Step 6 — Publish
npm publish --access public
# Package is live at: npmjs.com/package/agentpay-client

## Step 7 — Verify
npm info agentpay-client
# Should show version 1.0.0

## Step 8 — Test install
mkdir test-install && cd test-install
npm install agentpay-client
node -e "import('agentpay-client').then(m => console.log(Object.keys(m)))"

## Updating versions
# Patch (bug fix):  npm version patch → npm publish
# Minor (new tool): npm version minor → npm publish
# Major (breaking): npm version major → npm publish
