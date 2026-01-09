---
title: "TurborepoのCacheをGithub Actionsで使う、無料で"
date: '2023-05-18'
isPublished: true
lang: 'ja'
---

# TL;DR

- [dtinth/setup-github-actions-caching-for-turbo](https://github.com/dtinth/setup-github-actions-caching-for-turbo)を使おう

# はじめに

Turborepo は Vercel が開発したモノレポ環境用のビルドツールです。

https://turborepo.org/docs/getting-started

Turborepo には、モノレポ環境でのビルドを高速化するための機能、Remote Caching というものがあります。

https://turbo.build/repo/docs/core-concepts/remote-caching

これを用いることでキャッシュが効くようになり、CI が爆速で実行されるようになります。

しかし、この機能を使おうとすると Vercel のアカウントが必要になります。
個人利用(Hobby)では無料ですが、会社(Pro)で使うとすると $20 per user / month という価格になります
キャッシュするだけならまあまあ高いですね。

# Self-hosted Cache Server

解決策としては、Cache Server を自前で建てる方法があります。
これは公式にも記述があります。
https://turbo.build/repo/docs/core-concepts/remote-caching#custom-remote-caches

また、これを試した記事も既にあります。
https://zenn.dev/silverbirder/articles/af8bf125bd33ad
https://zenn.dev/aiji42/articles/7bc1b6df91dd76

しかし、サーバーを別で建てるのは面倒ですし、お金もかかります。

# Github Actions で Cache Server を自動的に建てる

そこで、冒頭で紹介した Action を導入します(はいそこ、Star が少ないから不安とか言わない)。

https://github.com/dtinth/setup-github-actions-caching-for-turbo

これを使うと、Github Actions を実行するときに、自動的に Cache Server を建ててくれます。
また、キャッシュは Github Actions のキャッシュに保存されるので、（同じブランチの CI ならば）次回以降はキャッシュを使い回すことで爆速で CI が実行されるようになります。
やったね!

```yml
on:
  - push
  - pull_request

permissions: read-all

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Launch Turbo Remote Cache Server
        uses: dtinth/setup-github-actions-caching-for-turbo@v1.1.0

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm

      - name: Install dependencies
        run: pnpm i

      - name: Lint
        run: pnpm run lint

      - name: Build
        run: pnpm run build
```

# ちなみに

↓ 別の Action もありましたが、なぜか自分の環境では動かなかったのと、環境変数を設定する必要があるので上の Action を用いる方が楽だと思います。
https://github.com/felixmosh/turborepo-gh-artifacts

# おわりに

Have a nice Turbo Life!
