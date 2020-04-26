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
