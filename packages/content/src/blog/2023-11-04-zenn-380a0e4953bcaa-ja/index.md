---
title: "Event Types in Svelte and TypeScript"
date: '2023-11-04'
isPublished: true
lang: 'ja'
---

> [!NOTE]
> この記事は[Event Types in React and TypeScript](https://www.totaltypescript.com/event-types-in-react-and-typescript)のSvelte版です。
> 英語版は気が向いたら書きます。

> [!NOTE]
> この記事ではSvelte 4.2.0以上を前提としています。

> [!WARNING]
> この記事ではHTML DOMの型についてのみ触れます。
> Svelte Componentの型の扱いについては以下のドキュメントを参照してください。
> https://svelte.dev/docs/svelte#types-componentevents

# The Problem

SvelteでTypeScriptを使っていると、しばしばこの種のエラーに遭遇することがあるでしょう。

```html
<script lang="ts">
	// @errors: 7006
	const onChange = (e) => {};
</script>

<input on:change="{onChange}" />
```

`onChange`関数の引数である`e`にどのような型を与えるべきかは必ずしも明確ではありません。
DOMごとにイベントには異なる型が与えられているためです。

幸い、いくつか解決策があります。

# Solution 1: 仮の関数を渡し、ホバーして型をコピーする

最初の解決策は、`on:change`に仮の関数を渡して、その関数の引数の型をホバーしてコピーする方法です。

![on:change hover](./0.png)

何やら複雑な型が表示されていますが、これをコピーして`onChange`関数の型として使うことができます。

```html
<script lang="ts">
	const onChange = (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
	) => {};
</script>

<input on:change="{onChange}" />
```

# Solution 2: `SvelteHTMLElements`から型を取得する

https://svelte.jp/docs/typescript#enhancing-built-in-dom-types

https://github.com/sveltejs/svelte/blob/5a8c1d2cafe8217aa1a6408b024571d3d655a431/packages/svelte/elements.d.ts

こちらにHTML DOMの型に関する記述があります。
これによれば、`SvelteHTMLElements`からDOMの属性の種類とそれぞれの属性が取るべき関数の型を取得することができます。

```html
<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	type InputOnChangeEvent = SvelteHTMLElements['input']['on:change'];
	const onChange: NonNullable<InputOnChangeEvent> = (e) => {};
</script>

<input on:change="{onChange}" />
```

これにより、`onChange`の引数`e`の型を決定できます。

# Solution 3: Type Helperを定義して引数の型を取得する

Solution 2のやり方はうまく行くのですが、毎回`SvelteHTMLElements`から型情報を取得するのは面倒です。
そのため、Type Helperを定義すると便利です。

```ts
import type { EventHandler, SvelteHTMLElements } from 'svelte/elements';

type Nullish<T> = T | null | undefined;

type GetEventHandlers<T extends keyof SvelteHTMLElements> = Extract<
	keyof SvelteHTMLElements[T],
	`on:${string}`
>;

export type SvelteHTMLElementEvent<
	TElement extends keyof SvelteHTMLElements,
	THandler extends GetEventHandlers<TElement>
> = SvelteHTMLElements[TElement][THandler] extends Nullish<EventHandler<infer TEvent, infer _>>
	? TEvent
	: never;
```

このType Helperを用いると、`onChange`の引数`e`に与えるべき型を簡単に取得できます。

```html
<script lang="ts">
	import type { SvelteHTMLElementEvent } from 'svelte-html-event';

	const onChange = (e: SvelteHTMLElementEvent<'input', 'on:change'>) => {};
</script>

<input on:change="{onChange}" />
```

このコードはライブラリ化してnpmに公開しているので、

```sh
bun install svelte-html-event
```

でインストールできます。

https://github.com/ryoppippi/svelte-html-event

> [!NOTE]
> ちなみに、SvelteのHTMLには独自の属性を定義することもできます。
> 上記の方法は独自の属性にも対応しています。
>
> https://svelte.dev/docs/typescript#enhancing-built-in-dom-types
> https://leaysgur.github.io/posts/2023/10/13/154305/

# まとめ

すでに自分の関わっているプロジェクトではSolution 3を使っています。
皆さんも是非お試しください〜
