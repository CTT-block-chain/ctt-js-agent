[![Build Status](https://travis-ci.com/CTT-block-chain/ctt-js-agent.svg?branch=master)](https://travis-ci.com/CTT-block-chain/ctt-js-agent)

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
yarn run uniapp_build
```

## run json-rpc server:(or use others process manage, like pm2)

```bash
yarn run jsonrpc_dev
#default is using dev env, port will be 5080, please modify config/*.json
#or you can use arguments --port xxxx
```

## unit test

```bash
yarn test
```

## uni-app webview demo use

```html
<template>
  <view>
    <web-view src="/hybrid/html/index.html" @message="handleMessage"></web-view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        title: "Wallet",
      };
    },

    methods: {
      handleMessage(evt) {
        let msg = evt.detail.data[0];
        switch (msg.action) {
          case "keyringReady":
            // here we try to create new account
            let currentWebview = this.$scope.$getAppWebview();
            let wv = currentWebview.children()[0];
            wv.evalJS('createAccount("test", "123456");');
            break;
          case "createAccountResult":
            console.log("create account result:", msg.data);
            break;
          default:
            console.log("unknow msg");
            break;
        }
      },
    },
  };
</script>
```
