---
title: "TailwindCSS/UnoCSS + Svelte でDynamicな値を使いたい！"
date: '2024-07-07'
isPublished: true
lang: 'ja'
---

# TL;DR

CSS Variable を経由するのが良さそう。

# 概要

この記事にあるように、そのまま変数を含んだclass名を使うと、TailwindCSS/UnoCSSでは反映されない。

https://zenn.dev/utamono832/articles/9cb66f9e68a345

例えば

```jsx
{@const margin = 50}

<div class={`m-${margin}`} />
```

このコードに対してはCSSを生成してくれない。

Svelte/SvelteKitの場合、class名の一部に含める変数を `{@const foo = 'bar'}` としたとしてもうまく評価されないっぽい(こういう値はビルド時に値はStaticに評価され、埋め込まれるはずだが..)。

SvelteのpreprocessorとPostCSS/UnoCSSのpreprocessorの順番が原因かもしれない。
ともかく、この方法ではうまくいかない。

# 解決策

CSS Variableを使うのが良さそう。
以下に例を示しておく。
このコードは `UnoCSS` を使っているが、`TailwindCSS` でも同様に使えるはず。

```jsx
{@const foo = 50}

<!-- css変数を経由することで、unocssのclassに値を渡すことができる -->
<div
    style:--foo='{foo}px'
    mb="[--foo]"
    />
```

SvelteのComponent内でCSS Variableを定義する場合は、`style:--foo='{bar}'` という形で指定する。
また、`mb="[--bar]"` という形を使うと、classから生成されるCSSは `--bar` というCSS Variableを参照するようになる。

これらを組み合わせた結果、

- Svelteのcompilerによって、`--foo` というCSS Variableはビルド時に `{ --foo: 50px; }` のようなStatic なCSSとして埋め込まれる。
- UnoCSSのpreprocessorによって、`mb="[--foo]"` というclass名から `{ margin-bottom: var(--foo); }` のようなCSSが生成される。

結果、`mb-50` というclass名を使った時と等価なCSSが生成される。

# まとめ

割と直感に反する解決策だが、これでうまくいった。
参考になれば幸いです。
