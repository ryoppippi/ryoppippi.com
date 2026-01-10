---
title: "SvelteKit, Progressive Enhancement, Form, Type Safety, そしてSuperforms"
date: '2023-04-28'
isPublished: true
lang: 'ja'
---

<!-- spellchecker:off -->

SvelteKit で最近さまざまな案件ができていて嬉しい限りである。
さて、SvelteKit のドキュメントにしばしば登場する Progressive Enhancement という概念がある。
この概念に自分は全く明るくなかったので調べてみた。

この記事ではまず、Progressive Enhancement とは何かを説明する。
次に、Sveltekit においてこの概念がよく表れている Form の扱いについて触れる。
最後に、SvelteKit における型安全について触れ、この型安全を強化する Superforms というライブラリを紹介する。

この記事は Rich Harris 氏の先日の講演の影響を多分に受けている。
/blog/2023-04-26-8addfe62eb4d3e-ja

# Progressive Enhancement

https://www.shopify.com/partners/blog/what-is-progressive-enhancement-and-why-should-you-care

https://accessible-usable.net/2010/06/entry_100606.html

https://developer.mozilla.org/ja/docs/Glossary/Progressive_Enhancement

これらの記事が詳しいが、簡単に解説する。
Progressive Enhancement とは、任意の環境で全てのユーザーが使用できるよう、基本となる機能は全てのブラウザで動作するようにして、その上に新しい環境でのみ動作するより高度な機能や装飾を追加実装する開発哲学である。
特段 Web 開発においては以下の手法を取ることが多い。

- HTML のみで基本的な機能を動作させ、情報が伝える
- その上で CSS による見た目の装飾を行う
- さらにその上で JavaScript を用いてより快適なインタラクションを実現する

これらの開発のメリットは

- HTML ベースで必要な機能が動くため、想定された JavaScript が動作する環境がない場合でも動作する
- 古い環境に合わせて実装を用意する必要がなく、１つのコードベースで動作する

といったものがある。

さて、現代において、JavaScript が動作しない環境などあるのだろうか。
IE の死を迎え、モダンブラウザが Desktop/Mobile ともに普及している現代において、JavaScript が動作しない環境はほぼないと言っていいだろう。
しかし現実には、 JavaScript が動かない、提供されないといったことは起きている^[[Everyone has JavaScript, right?](https://www.kryogenix.org/code/browser/everyonehasjs.html) ]。
また、通信制限のかかっているスマートフォンで JavaScript を完全に読み込むのに時間がかかりすぎて、想定した操作が行えないことは誰しもが経験していることだろう。

しかし、リッチな体験を提供するためには JavaScript は必要不可欠である。ゼロにすることはできない。
Progressive Enhancementの考え方は、ユーザーのそれぞれの環境でベストなパフォーマンス、ベストな体験を提供しようとするものである。

ちなみにこの反対としてGraceful degradation^[[Graceful degradation (グレースフルデグラデーション)](https://developer.mozilla.org/ja/docs/Glossary/Graceful_degradation)]という開発哲学もある。

# Form についておさらい

Form は HTML のタグであり、Form タグを使えばユーザーからの入力をサーバーに送ることができる。
例えば、以下は Form タグを使った簡単なログイン画面のコードである。
Form 内ではおなじみ`input`タグを用いてユーザーからの入力を受け取り、submit 属性のある`button`タグを用いて、その入力をサーバーに送信する。

```html
<form action="" method="POST">
	<label for="username">Username</label>
	<input type="text" id="username" name="username" />

	<label for="password">Password</label>
	<input type="password" id="password" name="password" />

	<button type="submit">Login</button>
</form>
```

サーバー側の処理はどんな言語でも良いが、SvelteKit ではこのように書く

```js
export const actions = {
	default: async (event) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');
		return { message: `Hello ${username}!` };
	},
};
```

# Form + Fetch API = 💔

https://drewdevault.com/2021/10/17/Reliability.html

> some stupid reason some asshole developer decided to reimplement all of the form semantics in JavaScript, and now I can’t pay my electricity bill without opening up the dev tools

さて、この Form によるデータの送信は、JavaScript が動作しない環境でも動作する。
しかし、この Form の実装では、送信時に画面が遷移してしまうという問題がある。
そのため、以下のように JavaScript を用いて、画面遷移を防ぎつつ、Form のデータを送信することが多い。

```html
<script>
	const form = document.querySelector('form');
	const url = 'https://example.com/login';

	form.addEventListener('submit', async (event) => {
		/** 本来のFormの動作を停止させ、画面遷移を止める */
		event.preventDefault();

		const formData = new FormData(form);
		const response = await fetch(url, {
			method: form.method,
			body: formData,
		});
		const data = await response.json();
		console.log(data);
	});
</script>

<form method="POST">
	<label for="username">Username</label>
	<input type="text" id="username" name="username" />

	<label for="password">Password</label>
	<input type="password" id="password" name="password" />

	<button type="submit">Login</button>
</form>
```

上で述べた通り、この実装では画面遷移がないため、例えば Loading Indicator などのインタラクションを実装することができる。
しかし、この実装では、JavaScript が動作しない環境では動作しない。
そのため一度 JavaScript の読み込みに問題が起きるといかなる操作もできなくなる。
ただログインしたいだけなのに...。

# SvelteKit の Form における Progressive Enhancement

https://kit.svelte.jp/docs/form-actions#progressive-enhancement

こちらも Document に全てが書いてあるが、簡単に説明する。

SvelteKit では、`use:enhance`action を Form に付与するだけで、Progressive Enhancement を実現できる。
言い換えれば、`use:enhance`が付与されている Form では、JavaScript が動作しない環境では伝統的な Form の送信、JavaScript が動作する環境では JavaScript を用いたリッチな体験をともなった Form の送信が行われる。

```html
<script>
	import { enhance } from '$app/forms';
</script>

<form method="POST" action="" use:enhance>
	<label for="username">Username</label>
	<input type="text" id="username" name="username" />

	<label for="password">Password</label>
	<input type="password" id="password" name="password" />

	<button type="submit">Login</button>
</form>
```

このように簡単な実装で、Project Enhancement を実現できる。
また、アニメーションやデータ加工等の処理を Client Side で行いたい場合は、`use:enhance`の代わりに`use:enhance={options}`を用いることで、より複雑な処理を行うことができる。

以下に、`use:enhance`を適用させたForm を用いた簡単なデモを用意した。
https://sveltekit-form-examples.vercel.app/
https://github.com/ryoppippi/sveltekit-form-examples

このサイトは、名前と何秒後にレスポンスを返すかを入力すると、その秒数後に `Hello {name}!` というメッセージを返す。
是非ともブラウザで JavaScript を無効化したり、遅い回線をエミュレートして試していただきたい。

![form_1](./2023-04-28-zenn/form_1.gif)
_通常の回線での Form の挙動。ローディングアニメーションなどリッチな画面が実現できている。_

![form_2](./2023-04-28-zenn/form_2.gif)
_50kbps の回線での Form の挙動。JavaScript が完全に読み込まれていないため、通常の Form の挙動になっている。_

# SvelteKit における型安全

https://svelte.jp/blog/zero-config-type-safety

さて、ここで趣向を変えてSvelteKit における型安全について説明する。

SvelteKitは型安全の保証を頑張っていて、かなり開発体験が良い。

以下にスクリーンショットを掲載する。

![form_3](./2023-04-28-zenn/form_3.gif)

SvelteKitに馴染みがない方に説明すると、
SvelteKitではページを表すためのファイルが３種類ある。`+page.js`, `+page.server.js`, `+page.svelte`である。
ざっくり言えば、`+page.svelte`は表示部分を担当するMarkup Languageであり、`+page.js`, `+page.server.js`はそれぞれ表示部分に流し込むデータを用意したり、サーバーの挙動を定義したりするファイルである。
`+page.server.js`には`load`関数を定義する。これがページの読み込み時に実行される関数である。
この返り値は、`+page.svelte`の`data`変数に渡ることになる。

素晴らしいことに、この２つの関数/変数はそれぞれ別々のファイルにまたがっているのにもかかわらず、SvelteのLanguage Serverが解析を頑張っているおかげで綺麗に型安全が保証されている。
上のスクリーンショットでは、`+page.server.js`の`load`関数の返り値を変更すると、`+page.svelte`の`data`変数の型が変わっていることがわかる。

さて、ページのレンダリング時の型安全が保証されていることはわかったが、では、Form の送信時の型安全はどうなっているのだろうか？
サーバー側でFormを受け取った時の処理は`+page.server.js`に`action`で定義する。

https://github.com/ryoppippi/sveltekit-form-examples/blob/986ffa369721ebdd45f063f131c5604db4bb307f/src/routes/%2Bpage.server.js#L3-L13

そして残念ながら、ここでは型安全が保証されていない。このコード上の`username`はnullかもしれないし、stringかもしれない。単なる`FormData`型である。
現状ではSvelteKitの標準ではForm Actionの型安全を保証する方法はない。

私はこの数ヶ月、この問題を打破しようと、Formを使うのをやめてtRPC+Zodを導入してみたりと数種類の試みをしていた。
しかしこれではProgressive Enhancementが達成できず、せっかくSvelteKitが提供してくれる開発体験が台無しになってしまう。
どうしようかと考えていた3月頃、Superformsというライブラリに出会った。

# Superforms + Zod = 💘

https://superforms.vercel.app

SuperformsはZodを用いて、Formの型安全を保証するライブラリである。
ご存じZodはランタイム時の型安全を保証してくれるライブラリであるが、これを用いることで、Formの送信時の型安全を保証することができる。
以下に例を示す。

https://sveltekit-form-examples.vercel.app/superforms

https://github.com/ryoppippi/sveltekit-form-examples/blob/82bd6695798b027c3b7abfd052092e8793144066/src/routes/superforms/%2Bpage.server.js#L6-L14

SuperformsではZodを用いてForm Schemaを定義する。そしてその情報を`load`関数の返り値に渡すことで、`+page.svelte`にFormの定義を渡している。

https://github.com/ryoppippi/sveltekit-form-examples/blob/82bd6695798b027c3b7abfd052092e8793144066/src/routes/superforms/%2Bpage.svelte#L1-L15

そして、`+page.svelte`では`data`変数で受けたZod Schemaを用いてSvelte Store^[[Stores / Writable stores • Svelte Tutorial](https://svelte.jp/tutorial/writable-stores)]を生成している。

https://github.com/ryoppippi/sveltekit-form-examples/blob/82bd6695798b027c3b7abfd052092e8793144066/src/routes/superforms/%2Bpage.svelte#L17-L29

このStoreをFormのそれぞれの`input`タグの`bind`ディレクティブに渡すことで、Formの値をStoreに反映させている。

さて、送信時の型をどのように検証しているのだろうか。

https://github.com/ryoppippi/sveltekit-form-examples/blob/82bd6695798b027c3b7abfd052092e8793144066/src/routes/superforms/%2Bpage.server.js#L16-L24

ここではaction内で先ほど定義したSchemaからValidatorを生成し、Formの値を検証している。
そして、検証に失敗した場合は`fail`関数を呼び出し、失敗したことをClientに伝えている。
もし成功した場合は、そのままサーバーで処理を行い、結果を渡している。

駆け足で解説したが、このようにSuperformsを用いることで、SvelteKitの開発体験を損なうことなく、Formの型安全を保証することができる。
もちろんProgressive Enhancementも達成できるので、JavaScriptがなくても動作する。

ちなみにこのSuperformsは先日の[SvelteHack](https://hack.sveltesociety.dev/)で見事Best Library賞に輝いていた。

# まとめ

本記事では、SvelteKitにおけるProgressive Enhancement、特にFormにおいてそれをいかに達成しているかについて解説した。
また、SvelteKitにおける型安全、またそれを強化するライブラリであるSuperformsについても解説した。
この記事が皆様のよきSveltekit Lifeを送るお手伝いになれば幸いである。
