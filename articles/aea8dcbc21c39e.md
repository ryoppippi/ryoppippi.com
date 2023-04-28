---
title: "Sveltekit, Form, Progressive Enhancement, Type Safety, そしてSuperform"
emoji: "💎"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["sveltekit", "svelte", "zod"]
published: false
---
SvelteKitの好きな機能の1つにFormがある。

あまりこれに関して書かれている記事もないので、思想的背景も含めて記事に記していきたい。

::: message
余談だが、SvelteKitに関する記事が少ないのは、まだ普及段階だというのに加えて[Document](kit.svelte.jp)が整備されすぎているというのもあると感じている。
正直Documentを読んで実装に困ったことが今のところない。
Documentの充実度合い/翻訳に感謝！
:::

# Formについておさらい
FormはHTMLのタグであり、Formタグを使えばユーザーからの入力をサーバーに送ることができる。
例えば、以下はFormタグを使った簡単なログイン画面のコードである。
```html
<form action="/login" method="POST">
  <label for="username">Username</label>
  <input type="text" id="username" name="username" />

  <label for="password">Password</label>
  <input type="password" id="password" name="password" />

  <button type="submit">Login</button>
</form>

```

![Form Image](/images/aea8dcbc21c39e/form_0.png)


# Progressive Enhancement

https://zenn.dev/ryoppippi/articles/8addfe62eb4d3e

# Sveltekitにおける型安全

https://svelte.jp/blog/zero-config-type-safety

# Superforms + Zod = 💘

https://superforms.vercel.app/
https://github.com/ciscoheat/sveltekit-superforms

# まとめ
 
