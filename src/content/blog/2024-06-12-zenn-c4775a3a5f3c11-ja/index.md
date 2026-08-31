---
permalink: /blog/2024-06-12-zenn-c4775a3a5f3c11-ja
title: "TypeScriptの型システムに命を吹き込む: Typia と unplugin-typia"
date: '2024-06-12'
isPublished: true
lang: 'ja'
description: "TypeScriptの型からランタイムValidationを生成するTypiaと、Vite・esbuild・webpack・Next.js・Bunで導入を簡単にするunplugin-typiaを解説します。"
---

<!-- spellchecker:off -->

> [!NOTE]
> 2025年6月14日追記:
> [`unplugin-typia`](https://github.com/ryoppippi/unplugin-typia)はアーカイブされました。
> 詳細に関しては[`README.md`](https://github.com/ryoppippi/unplugin-typia/blob/c7cbc58cb3cceaeb0117ae3dc4ee2e7cd866ff76/README.md)を参照してください。

# TL;DR

- この度、`unplugin-typia` という Library を作りました
- `unplugin-typia` を使うと今までめんどくさかった `Typia` の導入が簡単になります
- [`Vite`](https://vitejs.dev/)、[`esbuild`](https://esbuild.github.io/)、[`webpack`](https://webpack.js.org/)などフロントエンドで主流の様々なbundlerに対応しています
- [`Next.js`](https://nextjs.org/)でも簡単に使えます
- [`Bun`](https://bun.sh/docs/bundler)にも対応しています

https://github.com/ryoppippi/unplugin-typia/
https://jsr.io/@ryoppippi/unplugin-typia
https://typia.io/docs/setup/#unplugin-typia

# はじめに

皆さんはTypeScriptでのValidationにはどのような Library を使っていますか？

[`zod`](https://zod.dev/)はエコシステムが硬いし、最近だと[`valibot`](https://valibot.dev/)が流行りつつありますね。
また[`arktype`](https://arktype.io/)も注目に値するLibraryです。
[`typebox`](https://github.com/sinclairzx81/typebox)も耳にする機会が増えてきました。
また個人的には（厳密にはValidatorではないですが)、[`unknownutil`](https://github.com/jsr-core/unknownutil)も手に馴染んでよく使っています。

# 既存のValidation Library/TypeScriptに足りないもの

TypeScriptの型システムは非常に強力です。
アップデートを重ねた結果とても豊かな表現力を持ち、型システムとしてチューリング完全であることが知られています^[https://github.com/Microsoft/TypeScript/issues/14833]。
型パズルを駆使すればbrainf\*\*k interpreter^[https://github.com/susisu/typefuck]でさえ書けてしまいます。

しかし、型システムは実行時には消えてしまいます。また、TypeScriptでは原則として「値から型を作る」ことはできますが、「型から値を作る」ことはできません。

# 型から値への変換の限界

TypeScriptの型情報は開発時の安全性を提供しますが、実行時に動作することはありません。
例えば、以下のようなコードを考えます:

```ts
function someFunction(): any {}
const value: string = someFunction();
```

このコードではsomeFunctionの戻り値がstring型であることを保証するためにtype assertionや明示的なValidationが必要ですが、型自体からそのようなValidation logicを生成することはできません。

`zod`や`valibot`などの既存のValidation Libraryは、TSの Library として用意されたDSL（ドメイン固有言語）で assertion を定義し、そこからTypeScriptの型を生成(推論)することで型安全を担保しています。
これでは既存の型に対する Validation 関数を素朴な方法で用意できず、DSLを覚えて、一から Validation 関数を作りなおす必要があります。
このため型とValidation Logicが分離してしまうことがあります。
また、TSという型システムがあるのに、さらにDSLで型システムに準じるものを作り直すのは直感的ではないですよね。

# `Typia` とは

https://typia.io/

`Typia`は、このような課題を解決するためのツールです。

- 高速: `Typia`は既存のValidation Library に比べて非常に高速です。「`zod`の1500倍速い」とも言われています^[https://zenn.dev/hr20k_/articles/3ecde4239668b2#%E9%80%9F%E5%BA%A6%E3%81%AE%E6%AF%94%E8%BC%83]。
- 型情報から Validation を生成: TypeScriptの型情報を元に Validation を生成します。コンパイルが必要ですが、これにより型チェックの正確性とパフォーマンスが向上します。
- シンプルな記法: 特定の Library 特有の記法を覚える必要はなく、TypeScriptの標準的な型記述から Validation を生成します。
- 多機能: Validation だけでなく、高速なJSON変換、JSON Schema生成、ProtoBuf生成、ランダムデータ生成などの機能も提供します。

`Typia`の高速さは特筆すべき点であり、実際に使用したプロジェクトでは、APIドキュメントから自動生成された大量のTypeScript型ファイルを使って Validation を行う場面で非常に有効でした。

しかし、`Typia`の真の強みは、**「独自の記法を覚える必要がないこと」** にあります。
この点は既存の Validation Library との大きな差別化要因であり、`Typia`の導入障壁を大幅に下げています。
`Typia`を使えば、TypeScriptの標準的な記述に従うだけで、自然にValidationや他の機能を実現できるため、新しいLibraryに合わせてルールやシンタックスを覚える必要がありません。
開発者は既存のTypeScriptの知識だけで`Typia`を使いこなすことができるのです。

`Typia`は実行時に消え去る運命に合った型情報に息を吹き込む Library と言えるでしょう。

# `Typia` のコードを見てみよう

## シンプルな例

手始めに簡単な例から:

```ts
import typia from 'typia';

const b = typia.is<string>('hello world');
console.log(b);
```

このコードは、`'hello world'`が`string`型であるかどうかをチェックするコードです。
これを`Typia`でコンパイルすると以下のようなコードが生成されます。

```ts
// 生成されたコード
import typia from 'typia';

const b = ((input: any): input is string => {
	return typeof input === 'string';
})('hello world');
console.log(b); // true
```

このように、`typia.is`は **型情報から** Validation関数を生成します。
生成されたコードを見てみると、importされている`typia`はどこからも参照されていないので、このあとbundlerを挟むとtree-shakingされることがわかります。

## Object型の例

次は、一般的な型に対してValidationを行うコードを見てみましょう。
例えば、以下のような`Member`型があり、それをチェックするコードがあるとします。
ここではValidationを行う関数を生成するために[`typia.is`](https://typia.io/docs/validators/is/)を使っています。

```typescript
// 元のコード
import typia from 'typia';

type Member = {
	/**
  * @format uuid
  */
	id: string;

	/**
  * @type uint32
  * @minimum 20
  * @exclusiveMaximum 100
  */
	age: number;

	name: string;

	time?: Date;
};

const member = { id: '', name: 'taro', age: 20 } as const satisfies Member;
console.log(typia.is<Member>(member)); // false
```

これを`Typia`を使ってコンパイルするとランタイムでの型チェックを行うコードが生成されます。
少し長いので折りたたんでいます。

<details>
<summary>生成されたコード</summary>

```typescript
// Typiaによって生成されたコード
import typia from 'typia';
// ←もはや`typia`は使用されてないのでtree-shakingの対象になる
type Member = {
	/**
	 * @format uuid
	 */
	id: string;
	/**
	 * @type uint32
	 * @minimum 20
	 * @exclusiveMaximum 100
	 */
	age: number;
	name: string;
	time?: Date;
};
const member = { id: '', name: 'taro', age: 20 } as const satisfies Member;
console.log(
	((input: any): input is Member => {
		const $io0 = (input: any): boolean =>
			typeof input.id === 'string'
			&& /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(
				input.id,
			)
			&& typeof input.age === 'number'
			&& Math.floor(input.age) === input.age
			&& input.age >= 0
			&& input.age
			/**
			 * @format uuid
			*/ <= 4294967295
			 && input.age >= 20
			&& input.age < 100
			 && typeof input.name === 'string'
			&& (undefined === input.time || input.time instanceof Date);
		return typeof input === 'object' && input !== null && $io0(input);
	})(member),
); // false
```

</details>

また`typia`にはJSDocの代わりに`tag`を用いる別の書き方もあります。
生成されるコードは同じですが、Editor上で補完が効くので便利です。

```typescript
import typia, { tags } from 'typia';

type Member = {
	id: string & tags.Format<'uuid'>;
	name: string;
	time?: Date;
	age: number
		& tags.Type<'uint32'>
		& tags.Minimum<20>
		& tags.ExclusiveMaximum<100>;
};

const member = { id: '', name: 'taro', age: 20 } as const satisfies Member;
console.log(typia.is<Member>(member)); // false
```

型関数を用いたより複雑な型に対してもValidation関数を生成できます。

<details>
<summary>比較的複雑な型の例</summary>

```typescript
// 元のコード
import typia from 'typia';

type D = {
	/**
  * @format uuid
  */
	id: string;

	age?: number | null;
};

type Member = {
	name: string;
	id: string;
	details: D;
};

type ValidateType = Pick<Member, 'details'> & Omit<Member, 'id'>;

console.log(typia.is<ValidateType>({} as unknown)); // false
```

```typescript
// 生成されたコード
type D = {
	/**
	 * @format uuid
	 */
	id: string;
	age?: number | null;
};
type Member = {
	name: string;
	id: string;
	details: D;
};
type ValidateType = Pick<Member, 'details'> & Omit<Member, 'id'>;
console.log(
	((input: any): input is ValidateType => {
		const $io0 = (input: any): boolean =>
			typeof input.details === 'object'
			&& input.details !== null
			&& $io1(input.details)
			&& typeof input.name === 'string';
		const $io1 = (input: any): boolean =>
			typeof input.id === 'string'
			&& /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(
				input.id,
			)
			&& (input.age === null
				|| undefined === input.age
				|| typeof input.age === 'number');
		return typeof input === 'object' && input !== null && $io0(input);
	})({} as unknown),
); // false
```

</details>

`Typia`のDocumentにはPlaygroundが用意されているので、実際に試してみるといいでしょう。
https://typia.io/playground/

詳細なベンチマーク結果はこちらの記事を参照してください。
https://zenn.dev/hr20k_/articles/3ecde4239668b2

# Typiaの導入の課題

これまで`Typia`を使おうとすると、いくつかのハードルが必要でした。

`Typia`には２つのモードがあります。TransformationモードとGenerationモードです。

- Transformationモード: `tsc`のTransform APIを使って型情報からValidationを生成するモード。`tsc`実行時にValidationのコードが生成される。
- Generationモード: `Typia`のCLIを使って型情報からValidationを生成するモード。Bundlerが`tsc`を使わない場合に使う。

癖がなくハマりずらいのはGenerationモードです。
`Typia`のCLIを使ってコードを生成し、それを他のファイルから`import`するだけで使うことができます。
しかし、ビルドステップが一つ増えますし、管理するコードも増えるのでできればTransformationモードを使いたいですよね。

ところがTransformationモードは導入のハードルが高いです。

直接`tsc`コマンドを叩いてコンパイルする場合は導入が簡単ですが、他のBundlerを使う場合にはあらかじめ`tsc`を経由してBundleするように設定をする必要があります。

<details>
<summary>viteの例</summary>

```typescript
import react from '@vitejs/plugin-react';
import typescript from 'rollup-plugin-typescript2';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	esbuild: false,
	plugins: [
		react(),
		typescript(),
	],
});
```

</details>

ただ手元だとうまく動かないことも多かったです。特に`ts`/`tsx`以外の`html-ish`な言語^[https://biomejs.dev/blog/biome-v1-6/#partial-support-for-astro-svelte-and-vue-files]、例えば`svelte`や`vue`などを使用しているプロジェクトでは特に問題が多かったです。

https://github.com/samchon/typia/issues/812

そのため `Webpack` などのBundlerを用いたプロジェクト( `Next.js` など )では、`tsc`を使ってコンパイルをしていないため、Generationモードを使う必要がありました。

Generationモードを使ってもいいのですが、まあビルドステップが一つ増えますし、管理するコードも増えるので、できればTransformationモードを使いたいですよね。

# unplugin-typia

そこで、私は[`unplugin-typia`](https://jsr.io/@ryoppippi/unplugin-typia) を作りました。

https://github.com/ryoppippi/unplugin-typia
https://jsr.io/@ryoppippi/unplugin-typia

`unplugin-typia` は [`unplugin`](https://unplugin.unjs.io/) と`tsc`を組み合わせて作っています。
`unplugin` とは、`Vite` や `esbuild`、`webpack` などの複数のbundlerに対応したプラグインを共通のAPIで作るためのLibraryです。

`unplugin-typia`を使うと、複雑な設定をすることなく、bundlerでtypiaのTransform モード相当の体験を得ることができます。

> [!NOTE]
> それぞれのbundlerの詳しい説明は[JSR上のdoc](https://jsr.io/@ryoppippi/unplugin-typia/doc)を参照してください。
> また[examples](https://github.com/ryoppippi/unplugin-typia/tree/main/examples)には各bundlerごとのサンプルがあります。
> さらにいくつかのサンプルについては実際にデプロイされているので、試してみてください。
>
> | bundler                                     | deploy site                                                      | GitHub                                                                                             |
> | ------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
> | [Vite](https://vitejs.dev/)                 | [Cloudflare pages](https://unplugin-typia-vite-react.pages.dev/) | [`examples/vite-react`](https://github.com/ryoppippi/unplugin-typia/blob/main/examples/vite-react) |
> | [Vite + Sveltekit](https://kit.svelte.dev/) | [Cloudflare pages](https://unplugin-typia-sveltekit.pages.dev/)  | [`examples/sveltekit`](https://github.com/ryoppippi/unplugin-typia/blob/main/examples/sveltekit)   |
> | [Vite + Hono](https://hono.dev/)            | [Cloudflare pages](https://unplugin-typia-vite-hono.pages.dev/)  | [`examples/vite-hono`](https://github.com/ryoppippi/unplugin-typia/blob/main/examples/vite-hono)   |
> | [Next.js](https://nextjs.org/)              | [Vercel](https://unplugin-typia-nextjs.vercel.app/)              | [`examples/nextjs`](https://github.com/ryoppippi/unplugin-typia/tree/main/examples/nextjs)         |
>
> _(Vite + HonoはAPIのみのデプロイです。`README.md`を読んで`curl`してね！)_

# 実際に`unplugin-typia`を使ってみよう

では簡単に`unplugin-typia`と`Typia`を使って遊んでみましょう。

## `Bun` と一緒に使ってみる

一番手っ取り早く使う方法は[`Bun.build`](https://bun.sh/docs/bundler)を使うことです。

Github上にテンプレートを作成したので、それを使ってプロジェクトを作成します。

https://github.com/ryoppippi/bun-typia-template

```bash
git clone https://github.com/ryoppippi/bun-typia-template
cd bun-typia-template
bun i

# 以下のコマンドで実行
bun run index.ts

# もしビルドして実行したい場合
bun run build # build.tsを実行してビルドを行う。`./out`にビルドされたファイルが出力される
bun run ./out/index.js
# もしくは
node ./out/index.js
```

これだけで、`Typia`を使ったコードを実行することができます。

とっても簡単ですね。

## `Vite` + `Hono` + `unplugin-typia`で使ってみる

次に、`Vite`と[`Hono`](https://hono.dev/)と`unplugin-typia`を使って遊んでみましょう。

### プロジェクトの作成

まずは、プロジェクトを作成します。

```bash
npm create hono@latest ./my-app -- --template cloudflare-pages
cd my-app
npm install
```

次に、`unplugin-typia`をインストールします。
`unplugin-typia`は`JSR`に公開されているので、`jsr` コマンドを使ってインストールします。

```bash
npx jsr add -D @ryoppippi/unplugin-typia
```

そして`typia`を導入します。[Typiaのドキュメント](https://typia.io/docs/setup/#unplugin-typia)を参考にしてください。

```bash
npm i typia # typiaをインストール
npx typia setup # typiaのsetup wizardを実行
npm i @hono/typia-validator --force # honoのtypia-validatorをインストール
```

これで準備ができましたね！

### `unplugin-typia`の設定をする

`unplugin-typia`は`vite`のプラグインとして使います。
`vite.config.ts`に以下のように設定します。

```diff ts
 import build from '@hono/vite-cloudflare-pages'
 import devServer from '@hono/vite-dev-server'
 import adapter from '@hono/vite-dev-server/cloudflare'
 import { defineConfig } from 'vite'
+import UnpluginTypia from '@ryoppippi/unplugin-typia/vite';

 export default defineConfig({
   plugins: [
     build(),
+    UnpluginTypia(), // unplugin-typiaを追加
     devServer({
       adapter,
       entry: 'src/index.tsx'
     })
   ]
 })
```

### `Typia`を使って実装してみる

では、`src/index.tsx`に以下のコードを書いてみましょう。

```diff ts
 import { Hono } from 'hono'
 import { renderer } from './renderer'
+import typia from 'typia'
+import { typiaValidator } from '@hono/typia-validator'

+interface Props {
+  name: string
+}

 const app = new Hono()

 app.use(renderer)

 app.get('/', (c) => {
   return c.render(<h1>Hello!</h1>)
 })

+app.post('/',
+  typiaValidator('json', typia.createValidate<Props>()),
+  (c) => {
+    const data = c.req.valid('json');
+
+    return c.json({
+      success: true,
+      message: `Hello ${data.name}!`
+    })
+  }
+)

 export default app
```

これで準備ができました。

### 実行してみる

それでは、実行してみましょう。

```sh
$ npm run dev

> dev
> vite

 ╭──────────────────────────────────╮
 │                                  │
 │  [unplugin-typia] Cache enabled  │
 │                                  │
 ╰──────────────────────────────────╯

(!) Could not auto-determine entry point from rollupOptions or html files and there are no explicit optimizeDeps.include patterns. Skipping dependency pre-bundling.

  VITE v5.2.13  ready in 588 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

無事、起動できましたね！

それでは、APIを叩いてみましょう。

`curl`を使ってもいいのですが記述が長くなるので、ここでは[`xh`](https://github.com/ducaale/xh)を使ってみましょう。

```bash
$ xh :5173 name=ryoppippi
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 45
Content-Type: application/json; charset=UTF-8
Date: Wed, 12 Jun 2024 11:14:19 GMT
Keep-Alive: timeout=5

{
    "success": true,
    "message": "Hello ryoppippi!"
}
```

無事、Validationが通り、APIが叩けましたね！

試しに`name`を文字列ではなく数値で送ってみましょう。

```bash
$ xh :5173 name:=5
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 80
Content-Type: application/json; charset=UTF-8
Date: Wed, 12 Jun 2024 11:15:58 GMT
Keep-Alive: timeout=5

{
    "success": false,
    "error": [
        {
            "path": "$input.name",
            "expected": "string",
            "value": 5
        }
    ]
}
```

Validation Error が返ってきましたね！

### Cloudflare Pagesにデプロイしてみる

最後に、Cloudflare Pagesにデプロイしてみましょう。

```bash
$ npm run deploy
$ $npm_execpath run build && wrangler pages deploy
$ vite build

 ╭──────────────────────────────────╮
 │                                  │
 │  [unplugin-typia] Cache enabled  │
 │                                  │
 ╰──────────────────────────────────╯

vite v5.2.13 building SSR bundle for production...
✓ 50 modules transformed.
dist/_worker.js  67.14 kB
✓ built in 167ms                                                                                                                                                                                                          The project you specified does not exist: "hono-vite". Would you like to create it?"
❯ Create a new project
✔ Enter the production branch name: … main
✨ Successfully created the 'hono-vite' project.
🌏  Uploading... (1/1)

✨ Success! Uploaded 1 files (1.61 sec)

✨ Compiled Worker successfully
✨ Uploading Worker bundle
✨ Uploading _routes.json
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://xxx.pages.dev
```

無事デプロイできましたね！
あとはこのURLを実際に呼んでみましょう。

```bash
$ xh https://xxx.pages.dev name=ryoppippi

# 省略

{
    "success": true,
    "message": "Hello ryoppippi!"
}
```

無事デプロイされたAPIが叩けましたね！

# まとめ

- `unplugin-typia`を使うと`Typia`の導入が簡単になります
- `Vite`、`esbuild`、`webpack`などのbundlerに対応しています
- `Typia`は楽しい
- `Typia`は面白い！

ぜひ`Typia`を試してみてください！

# Appendix

## `jsonup` + `typia`

`jsonup`はTypeScriptで書かれたJSON Parserです。
JSON形式のLiteral Stringを与えると型推論を行うという、謎技術 Library です（本人曰くネタで作ったそうですが、TypeScriptのCompilerの限界に挑戦してる感が好きです）。

https://github.com/tani/jsonup

そして、`jsonup`と`typia`を組み合わせるとなんと、文字列からvalidation関数が生成されるという、なんとも不思議なことができます。

https://x.com/ryoppippi/status/1800183030235255019

`typia`にはrandom generatorがついているので、JSONの文字列を例として与えるとそれに合致するランダムな値を生成する、なんてこともできます。

```ts
import type { ObjectLike } from 'jsonup';
import typia from 'typia';

const jsonSample = `{ "name": "jsonup", "age": 34}`;

/**
 * type Obj = {
 *    name: string;
 *    age: number;
 * }
 */
type Obj = ObjectLike<typeof jsonSample>;

console.log(typia.random<Obj>());
```

```sh

$ bun run ./index.ts
{ name: 'dvdnp', age: 49.25475568792122 }
$ bun run ./index.ts
{ name: 'htgywkaq', age: 13.818270173692525 }
$ bun run ./index.ts
{ name: 'pyurujgkvd', age: 47.19975642889989 }
```

https://github.com/ryoppippi/bun-typia-jsonup-experiments

GitHubからコードを落とせるのでぜひ遊んでみてください。

自分は`jsonup`や`type-fest`のような型パズルの Library が大好きなので、これらに息を吹き込めるような`typia`はとても楽しいです。

## `typefuck` + `typia`

[`typefuck`](https://github.com/susisu/typefuck) とは、型レベルで実装されたBrainfuck interpreterです。

https://github.com/susisu/typefuck

この実装により、TypeScriptの型システムはチューリング完全であることがわかるのですが、こちらも`Typia`と組み合わせることができます。

```ts
import type { Brainfuck } from '@susisu/typefuck';
import typia from 'typia';

type Program = '>, [>, I<[.<]';
type Input = 'Hello, world!';
type Output = Brainfuck<Program, Input>;

console.log(typia.is<Output>('!drow ,olleH')); // true
```

## `type-fest` + `typia`

[`type-fest`](https://github.com/sindresorhus/type-fest)とは、TypeScriptで型を操作する時の便利関数を集めたLibraryです。

https://github.com/sindresorhus/type-fest

たとえば、xor^[https://ja.wikipedia.org/wiki/%E6%8E%92%E4%BB%96%E7%9A%84%E8%AB%96%E7%90%86%E5%92%8C]を実現するための型として`MergeExclusive`が用意されています。
これを`Typia`と組み合わせると、それぞれのkeyに対して排他的なObject型ができあがります。

```ts
import type { MergeExclusive, SimplifyDeep } from 'type-fest';
import typia from 'typia';

type ExclusiveVariation1 = {
	exclusive1: boolean;
};

type ExclusiveVariation2 = {
	exclusive2: string;
};

type ExclusiveOptions = SimplifyDeep<
	MergeExclusive<
		ExclusiveVariation1,
		ExclusiveVariation2
	>
>;

const is = typia.createIs<ExclusiveOptions>();

console.log(is({ exclusive1: true })); // true
console.log(is({ exclusive2: 'string' })); // true
console.log(is({ exclusive1: true, exclusive2: 'string' })); // false
```

<details>
<summary>ExclusiveOptionsの型</summary>

```ts
type ExclusiveOptions = {
	exclusive1?: undefined;
	exclusive2: string;
} | {
	exclusive2?: undefined;
	exclusive1: boolean;
};
```

</details>

また、`IntRange`という型もあります。この型は指定された範囲の整数を表します。
これを使って、1ケタの数字を表す型を作り、Validation関数を生成してみましょう。
さらに、`random`関数を使ってランダムな値を生成してみます。

```ts
import type { IntRange } from 'type-fest';
import typia from 'typia';

type Digit = IntRange<0, 10>; // 0 <= Digit < 10

const is = typia.createIs<Digit>();

console.log(is(5)); // true
console.log(is(11)); // false
console.log(is(-1)); // false

console.log(typia.random<Digit>()); // 5 (or any other number between 0 and 9)
```

<details>
<summary>random関数のコンパイル結果</summary>

```ts
console.log(((generator) => {
	const $pick = typia.random.pick;
	return $pick([
		() => 0,
		() => 1,
		() => 2,
		() => 3,
		() => 4,
		() => 5,
		() => 6,
		() => 7,
		() => 8,
		() => 9
	])();
})());
```

</details>

自分の知る限り、従来型のValidation Libraryでこのようなロジックを組んだとしても、それが型（`z.infer<foo>`など）に反映されることはないと思います。
たとえば`zod`であれば

```ts
import { IntRange } from 'type-fest';
import { z } from 'zod';

const digit = z.number().int().min(0).max(10).transform(x => (x as IntRange<0, 10>));
```

とする必要がありますが、これは型とValidation Logicが分離してしまっていますよね。

`Typia`は型情報からValidation Logicを生成するため、型とValidation Logicが一体となっているのが特徴です。

> [!NOTE]
> `Digit`の例は、一応`Typia`の記法を使うと
>
> ```ts
> import {'\{'} tags {'\}'} from 'typia';
> type Digit = number
>  & tags.Type<'uint32'>
>  & tags.Minimum<0>
>  & tags.ExclusiveMaximum<10>
> ```
>
> と書くこともできます。
>
> `Typia`記法を使うメリット
>
> - 範囲で指定ができる(`type-fest`はunion型なので)
> - 範囲指定の方がJSON Schema等の生成に有利(`type-fest`だとunion型なのでとりうる数字が全て列挙される...)
>
> `type-fest`記法を使うメリット
>
> - Editor 上で補完が効く(取りうる値が個別の Literal 型として型情報に反映されているので）
> - 範囲外の数値に対してEditor 上で型エラーが出る(取りうる値が型情報に反映されているので）

## `zod`/`valibot`とバンドルサイズの比較

先ほどの`Typia`での実装例を`zod`と`valibot`で書いた例と比較してみましょう。

```typescript
import { z } from 'zod';

const Member = z.object({
	id: z.string().uuid(),
	age: z.number().int().min(20).max(99),
	name: z.string(),
	time: z.date().optional(),
});

type Member = z.infer<typeof Member>;

const member = { id: '', name: 'taro', age: 20 } as const satisfies Member;

console.log(Member.parse(member));
```

```typescript
import * as v from 'valibot';

const Member = v.object({
	id: v.pipe(v.string(), v.uuid()),
	age: v.pipe(
		v.number(),
		v.integer(),
		v.minValue(20),
		v.maxValue(99) // exclusiveの代わりに-1しておく
	),
	name: v.string(),
	time: v.optional(v.date()),
});

type Member = v.InferOutput<typeof Member>;

const member = { id: '', name: 'taro', age: 20 } as const satisfies Member;

console.log(v.is(Member, member));
```

| Library   | バンドルサイズ |
| --------- | -------------- |
| `typia`   | **0.563 kb**   |
| `zod`     | 117 kb         |
| `valibot` | 8.50kb         |

とても小さいですね！

## bundle sizeについて補足

現在の実装でも`createIs`という型をチェックするだけの関数を生成する場合はバンドルサイズがとても小さいです。
しかし、エラーメッセージを生成するための関数を生成しようとすると、なぜかそこにRandom Generatorを含めてしまいバンドルサイズが大きくなってしまうようです。
おそらく`zod`と同じように Library のかなりの部分を巻き込んでバンドルされているようです。
それでも`zod`よりは全然小さいですが...
(余談ですが、[ `zod`も次のバージョンでバンドルサイズを削減する予定です ](https://github.com/colinhacks/zod/pull/2850))

これについては `Typia` は現在内部のリファクタリングを進めています。

また、先日リリースされた`v6.1.0`では、本格的に `Typia` が ESM に対応しました。
これにより、Validationの関数のバンドルサイズは手元だと2/3ほどになりました。

https://github.com/samchon/typia/releases/tag/v6.1.0

## 開発環境について

<details>
<summary>ひとりごと</summary>

今回の `unplugin-typia` は `npm` ではなく `JSR` で公開されています。
`JSR` は `npm` と同じようにパッケージを公開できるサービスですが、`npm` とは異なり、サーバー上で `package.json` の生成や TypeScript のコンパイルを開発者の代わりに行ってくれるので、 Libaray の公開がとても簡単です。
欠点としてESMにしか対応していないので、例えば `Webpack` の設定を書くときは直接 `require` するとエラーになってしまいますが、[`jiti`](https://jiti.unjs.io/) などを経由すれば問題ありません。
実際、[Webpackの導入方法](https://jsr.io/@ryoppippi/unplugin-typia/doc/webpack/~/default) では `jiti` を使った方法を紹介しています。

またローカルでは `Bun` を使って開発しています。
`Bun` は TypeScript をそのままimport、実行できるのでとても楽でした。

結果的に bundler 向けの plugin を作っているのに自分は一切 bundler を使わない、という謎な状況になっていますが、開発体験はめちゃくちゃ良かったです。

まあ`unplugin-typia` のコードベースが `Bun` である必要も特にないので、`node_modules` を管理しなくて済む `Deno` に移行するかもしれません。
`Deno` も直接 TypeScript を実行できますし、何より `JSR` との相性は抜群ですからね。

</details>

## リンクなど

- [Typia](https://typia.io/)
- [Typia Setup Guide](https://typia.io/docs/setup/#unplugin-typia)
- [作者によるTypiaについての解説記事](https://dev.to/samchon/typescript-json-is-10-1000x-times-faster-than-zod-and-io-ts-8n6)
- [unplugin-typia](https://jsr.io/@ryoppippi/unplugin-typia)
- [unplugin-typia/examples](https://github.com/ryoppippi/unplugin-typia/tree/main/examples)
- [bun-typia-template](https://github.com/ryoppippi/bun-typia-template)
- [bun-typia-jsonup-experiments](https://github.com/ryoppippi/bun-typia-jsonup-experiments)
