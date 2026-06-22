---
title: "satisfies で exhaustiveness check"
date: '2024-06-16'
isPublished: true
lang: 'ja'
---

# TL;DR

```ts
type A = 'a' | 'b' | 'c';

function exhaustive(v: A) {
	switch (v) {
		case 'a':
			return 'A';
		case 'b':
			return 'B';
		case 'c':
			return 'C';
		default:
			return v satisfies never; // check exhaustiveness
	}
}
```

# はじめに

TypeScriptに`satisfies`文が追加されて久しいですね。

`satisfies`が導入される前は、`switch` 文の exhaustiveness (網羅性) チェックを行うために、以下のような実装をよくしていました。

```ts
type A = 'a' | 'b' | 'c';

function exhaustive(v: A) {
	switch (v) {
		case 'a':
			return 'A';
		case 'b':
			return 'B';
		case 'c':
			return 'C';
	}
	const _: never = v;
}
```

または `if` 文を使って:

```ts
type A = 'a' | 'b' | 'c';

function exhaustive(v: A) {
	if (v === 'a') { return 'A'; }
	if (v === 'b') { return 'B'; }
	if (v === 'c') { return 'C'; }
	const _: never = v;
}
```

これにより、もし `switch` 文や `if` 文の条件分岐が変数 `v` に対して網羅的でない場合、`never` 型に `v` を代入することで、コンパイルエラーを発生させることができます。

しかし、いくつか問題がありました。

- `switch` 文の外で `const _: never = v;` を書くのはなんとなく気持ち悪い( `case` の中で値を宣言するのは [`no-case-declarations`](https://eslint.org/docs/latest/rules/no-case-declarations) 違反なのでできない)
- `eslint` の `no-unused-vars` などのルールに引っかかる (一応 `_` を除外する設定をすることもできるが)

# `satisfies` で exhaustiveness check

TypeScript 4.9 から、`satisfies` が導入されました。

これを使うと、以下のように書くことができます。

```ts
type A = 'a' | 'b' | 'c';

function exhaustive(v: A) {
	switch (v) {
		case 'a':
			return 'A';
		case 'b':
			return 'B';
		case 'c':
			return 'C';
		default:
			return v satisfies never; // check exhaustiveness
	}
}
```

こちらの方がすっきりとしていますね。
また、`eslint` のルールにも引っかからないので、煩わしいエラーともおさらばできます。

# `switch(true)` との組み合わせ

TypeScript 5.3 より、`switch(true)` による型のnarrowingが改善されました。

https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-3.html#switch-true-narrowing

そのため、複雑なunion型に対しても、`switch(true)` と `satisfies` を組み合わせることで、網羅性チェックを行うことができます。

```ts
type A = [] | 3 | string;

function exhaustive(v: A) {
	switch (true) {
		case Array.isArray(v):
			return '[]';
		case v === 3:
			return '3';
		case typeof v === 'string':
			return v;
		default:
			return v satisfies never; // check exhaustiveness
	}
}
```

# おわりに

`satisfies` いいね
