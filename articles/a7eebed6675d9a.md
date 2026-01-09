---
title: "ryoppippi的Opinionated UnoCSS Shortcuts その1"
emoji: "💡"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ['unocss', 'css']
published: true
---

:::message
この記事は著者のブログ記事[My Opinionated UnoCSS Shortcuts & Rules](https://ryoppippi.com/blog/2024-10-11)を日本語に翻訳したものです。
:::

最近、私のプロジェクトで[UnoCSS](https://unocss.dev/)を使い始めました。そして、とても気に入っています。

私のお気に入りの機能の1つは[`shortcuts`](https://unocss.dev/config/shortcuts)と[`rules`](https://unocss.dev/config/rules)です。
`shortcuts`を使うと、複数のclassの組み合わせに対して単一の略語を定義できます。例えば、`class="p-4 m-4 bg-gray-100 text-gray-900"`と書く代わりに、`class="card"`と書くことができます。
ruleを使うと、特定の要素に適用されるべきclassのセットを定義できます。これは複雑なruleを作成する際に非常に便利です。

私は[`@ryoppippi/unocss-preset`](https://github.com/ryoppippi/unocss-preset)というライブラリを作成しました。これには私の独自のshourtcutとruleが含まれています。

https://github.com/ryoppippi/unocss-preset

その一部を共有したいと思います。

::: message alert
短すぎるshourtcutを使用すると、コードの可読性が低下する可能性があるので、独自のshourtcutを作成する際は注意してください。
:::

## `flex` shourtcut

以前、`items-center`と`justify-center`について混乱したことがあるかもしれません。
`items-center`は垂直方向の配置用で、`justify-center`は水平方向の配置用です。

ところで、marginを設定する際、水平方向のmarginには`mx-`を、垂直方向のmarginには`my-`を使用できます。
そこで、これらの命名規則に基づいて`flex`用のshourtcutを作成しました。

```ts
const shortcuts = {
	fxc: 'flex justify-center',
	fxs: 'flex justify-start',
	fxe: 'flex justify-end',
	fyc: 'flex items-center',
	fys: 'flex items-start',
	fye: 'flex items-end',
	fcc: 'flex items-center justify-center',
};
```

## `grid` shourtcut

`grid`用のshourtcutも作成しました。

`grid`と`place-content-center`を使用してコンテンツを中央に配置できます！これは簡単です。さらに、`place-items-center`を使用して複数のアイテムを中央に配置することもできます。

```ts
const shortcuts = {
	gc: 'grid place-content-center',
	gcc: 'gc place-items-center',
};
```

https://zenn.dev/tonkotsuboy_com/articles/css-grid-centering

将来的にさらにshourtcutを追加する予定です。その際には、新しい記事を書きます。

では、次回お会いしましょう！
