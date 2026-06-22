---
title: "雑にシングルファイルのWebアプリを作る時に使ってるもの"
date: '2024-07-01'
isPublished: true
lang: 'ja'
---

# TL;DR

[ Deno ](httpe://deno.land) の力を借りつつ、[esm.sh](https://esm.sh/)で依存関係を解決。

https://deno.com/
https://esm.sh

# 本編

まずHTMLファイルとJSファイルを作る。

```sh
touch index.html index.js
```

初っ端からシングルファイルじゃなくてタイトル詐欺で草と思うかもしれないが、後ほど言及する。

`index.html`には雛形として以下を書いておく。
ベースは `emmet` の `html:5` で出てくるものを使っている。
スニペットに登録しておいてもいい。

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<script type="module" src="./index.js"></script>
		<title>foo</title>
	</head>

	<body>
		<!-- なんでも良い -->
		<input id="input" type="text" />
		<div id="info"></div>
		<img id="image" src="" alt="" />
	</body>
</html>
```

で、あとは好きなように `index.js` を書いていく。
ミソなのは

- JavaScriptでそのまま書く
- 型が必要ならJSDocを書く
- 依存関係は `esm.sh` から`import`する

近頃`polyfill.io`の騒動で外部CDNに依存するのはあまりよくないと言われているが、使い捨ての小物なので問題ない。

[`esm.sh`](https://esm.sh)は本当に便利で、`npm`や`jsr`にあるライブラリをサーバー上で`esm`形式に変換してくれるのでそのままブラウザで`import`できる。
もちろんちゃんとしたアプリを作るときはバンドルしてtree-shakingとかするべきだが、ちょっとしたものを作るときには便利。
ブラウザで動くライブラリは大体動く。動かなくて困ったことはない。

編集する時は、`deno`の`lsp`を使うと、`esm.sh`から`import`したmoduleについては型が補完される。
それでも足りない場合は`JSDoc`を書く(そしてJSDocはほとんどの場合Copilot君が補完してくれる)。
これで体験を落とさずJSでコードを書くことができる。

```js
import * as IM from "https://esm.sh/image-meta@0.2.0";
import { toUint8Array } from "https://esm.sh/uint8array-extras@1.2.0";
import { effect, ref } from "https://esm.sh/@vue/reactivity@3.4.31";

const $ = document.querySelector.bind(document);

/** @type {HTMLInputElement} */
const input = $("#input");

/** @type {HTMLImageElement} */
const infoDiv = $("#info");

/** @type {HTMLImageElement} */
const img = $("#image");

/** @type {{meta: IM.ImageMeta, url: string}|null} */
const info = ref(null);

/** infoが変更されたらDOMを更新 */
effect(() => {
  if (info.value == null) return;
  const { meta, url } = info.value;
  infoDiv.innerHTML = JSON.stringify(meta, null, 2);
  img.src = url;
});

/** inputが変更されたら画像を読み込んでメタデータを取得 */
input.addEventListener(
  "input",
  (e) => {
    const url = e.target.value;
    if(!URL.canParse(url)) return;

    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const meta = IM.imageMeta(toUint8Array(await res.arrayBuffer()));
        info.value = { meta, url };
      });
  },
);
```

formatもlintも型チェックもそれぞれ `deno lint`、`deno fmt`、`deno check` でできるので、`npm` で `eslint` や `prettier` 、 `biome` とかを入れる必要がない。
`node_modules`の管理とかやりたくもない。
コンパイルも必要ない。本当に楽。

この記事では JavaScript は `index.js` に切り出しているが、 HTML に直接書いてもいい。
その場合は[ PartEdit ](https://github.com/thinca/vim-partedit) とかを使うと一部分を切り出してJavaScript ファイルとして編集できるので便利。

https://github.com/thinca/vim-partedit

<details>
<summary>ところで上のコードに vue がいるけどなんで??</summary>

`vue` の `reactivity` は `Svelte` のものと違い、ランタイムベースの実装になっている。
つまりビルドステップが必要ない。
またコアの部分は標準的なJavaScriptで実装されているので `vue` に依存していない。
つまり、ただのJavaScriptライブラリとして使うことができる。
https://x.com/youyuxi/status/1804005076853219445

FrontEndに限らず、実はServer SideやCLIでも使える。

https://ja.vuejs.org/guide/extras/reactivity-in-depth

</details>

# どこで使うのか

以下のような状況を想定している

- 本当に最小限の機能だけを持つツールが求められてる時
- ランタイムをインストールするとか、複数ファイルを渡すとかが面倒である場合
- シェルスクリプトに慣れてない人向けに、ブラウザで動くツールを作りたい場合（エンジニア相手だったらシェルスクリプトでもなんでもいいと思う)
- メールやSlackでさっと渡せるような、ぺらっとした１枚のHTMLで済ませることが望ましいとされている場合
- ビルドとかテストとか必要ない（し、やりたくない）場合

そんな状況あるのだろうかという話があるが、まあまあある。
そんな時にいちいちツールとか入れてビルドして、ビルド結果が複数ファイルになってて、それを先方に渡して
「`node index.js` でやってください! あれ`Node`入ってない、ブラウザだけしか使えない？」
「シェルスクリプト動かしてください、あれ、terminal使えない？」
とかなることがちょくちょく発生する。
そんな時に便利。

開発するのも簡単で便利。
ブラウザで完結するのも楽。

これよりもう少し複雑な設計が必要なら、`Vite` + `React` or `Svelte` で素直にバンドルしてしまうのが筋がいいと思う。
`node_modules` の管理は面倒だが。

# 関連記事

https://zenn.dev/razokulover/articles/7653ef0336db77
