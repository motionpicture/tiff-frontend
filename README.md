# TIFFチケットシステム

## Features

## Getting Started

### インフラ
#### web server
node.js application  
- iis on [Azure WebApps](https://azure.microsoft.com/ja-jp/services/app-service/web/)

#### DB
- MongoDB
- Redis Cache

### 言語
[TypeScript](https://www.typescriptlang.org/)

### 開発方法
[npm](https://www.npmjs.com/)でパッケージをインストール。

```shell
npm run install:development
```

typescriptをjavascriptにコンパイル。

```shell
npm run build -- -w
```

[WebMatrix](https://www.microsoft.com/japan/web/webmatrix/)でローカルサーバーを起動。


### Required environment variables
```shell
set NODE_ENV=**********環境名**********
```

only on Aure WebApps

```shell
set WEBSITE_NODE_DEFAULT_VERSION=**********node.jsバージョン**********
set WEBSITE_TIME_ZONE=Tokyo Standard Time
```

## clean
`npm run clean`で不要なソース削除。
