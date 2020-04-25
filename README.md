# ctt-js-agent

## install dependences:

```bash
yarn install
```

## bundle webview js for uni-app:

```bash
#install browserify:
yarn install browserify -g

#bundle js:(output is bundle.js)
browserify uniapp/index.js -o uniapp/bundle.js
```

## run json-rpc server:(or use others process manage, like pm2)

```bash
node jsonrrpc/jsonrpc.js
```
