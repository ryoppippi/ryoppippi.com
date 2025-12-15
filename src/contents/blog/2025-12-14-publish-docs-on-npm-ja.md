---
title: ドキュメントをnpm packageとしてpublishしよう
date: '2025-12-14'
isPublished: true
lang: ja
---

> [English](https://ryoppippi.com/blog/2025-12-14-publish-docs-on-npm-en)

# TL;DR

- LLMフレンドリーなドキュメント提供方法としては、ローカルにダウンロードさせるのが現時点では最も効率が良い
- library提供者は、ドキュメントを`npm`等のpackageとしてpublishすることを検討するべき（例: `@foo/docs`）
- Vibe Codingが盛んな今日において、libraryやframeworkがLLMフレンドリーであることはとても重要

> Note: このブログでは主にJavaScriptエコシステムに絞って話をするので、`npm` registryにpublishする話を書いています。他のエコシステムについては他のエコシステムなりのpackage配布手段があるので、そこに置き換えて考えてみてください

# 2025年の漢字は「Coding Agent」と「MCP」

2025年はCoding Agentの年でした。3月に[Claude Code](https://code.claude.com/)が発表され、5月にGAになってからはその勢いはとどまることなく、その後[Codex](https://codex.dev/)や[OpenCode](https://opencode.dev/)などのAgent人気にも火がつきました。
世の中を見渡すと、日頃どのようなモデルがCodingに良いか、どのエージェントがうまく出力を出すか、どのようなツールがコード生成をサポートするかといった話題で持ちきりです。
これに加えて、MCPの普及もありました。特にCoding Agentを助けるものとしては効果的であるとされ、毎日のように新しいMCP Serverが公開され、人々はそれについて話しています。

# LLMから望む出力を得るには

ところで世の中にはいろいろな開発ツールやlibraryがあります。LLMは主に有名なものを学習対象にしており、かつ[knowledge cutoff](https://en.wikipedia.org/wiki/Knowledge_cutoff)後の知識については当然知り得ないため、当然、何もしないままポン出しでは望む出力が得られません。
有名な話ではSvelte4と5の違い、React Router V6とV7の違いなど、breaking changesが行われたWeb Frontend Frameworkなどでは顕著に表れていました。さらにCLIツールを作るためのlibraryなどは得てしてマイナーなもの、学習対象が少ないものが多くなりがちで、出力結果が望ましいものでない場合が多いです。
これらの問題を解決するためには、いかにしてLLMにできる限りの情報を与えられるかという環境整備の話が大事になってきます。つまり、LLMの知識にないものをできるだけ用意してアクセスできる状態にすることで望み通りの情報を得られるようにLLMを導く、ということです。
この約1年を通して様々な場所で色々な議論が行われてきました。それぞれの良いこと、悪いこと、その時に良いとされてきたもの、振り返ってみると微妙だったよねとなっているもの、様々あります。

# けつろんぱ

Vibe Codingが盛んな今日において、libraryやframeworkをLLMフレンドリーにすることはますます重要になっています。LLMと相性が悪いlibraryは、それだけで選択肢から外される可能性があります。では、library提供者はどのようにしてLLMフレンドリーな環境を実現できるでしょうか？

結論から言うと、LLMフレンドリーなドキュメント提供方法としては、**ローカルにあるだけのものをダウンロードしそれをCoding Agentが自由に読める状態にする**ことが現時点では最も効率が良いです。
libraryの提供者は、ドキュメントをバージョン管理可能な状態で`npm`等のregistryに上げるのが現時点では最も効果的なのではないかと筆者は考えています。
ブログではドキュメントを与える方法がどのように変わっていったか、そしてなぜその方法が一番良いと筆者が結論づけているのかについて論じていきます。

# ドキュメント提供方法の変遷

## RAG

RAG (Retrieval-Augmented Generation)は、LLMに外部知識を与えるための方法として広く知られています。
2022年11月にChatGPTが公開された後、人々の間で、「関連情報とプロンプトを一緒に渡せば知識に基づいた望ましい出力が得られる」という認識が広まりました。
これに伴ってプロンプトからいかに関連した情報を取り出して渡すかという議論が盛んになりました。
ここではRAGの具体的な手法には触れませんが、ドキュメントを渡してone-shotで回答を得るということの大切さの議論は、ここから盛んになったものと考えられます。

## Web Search

2023年、ChatGPTにWeb検索機能が追加されました。これにより、LLMはインターネット上の最新情報にアクセスできるようになりました。
ChatGPTが能動的に情報をネットから探して、それについて回答を生成することが可能になりました。
ただし、HTMLという構造はLLMフレンドリーではなく、また毎回検索をするのはコストが高いため、決して効率のいい方法とは言えません。
現代のCoding Agentはウェブ検索機能を搭載するのが当たり前になっている一方、この問題は今後もついて回ることになるでしょう。
こと現在の[Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)の常識を鑑みるにWeb Searchに頼るのは最終手段にすべきでしょう。

## llms.txt

[`llms.txt`](https://llmstxt.org/)は、2024年9月に提案された、比較的新しいウェブ標準"案"です。
`llms.txt`を用いることで、WebサイトはHTMLのような人間にとっての構造を廃し、LLMにとって必要最低限の情報をマークダウンで記述することで、トークン量を減らしつつ正確な情報を提供することができます。

[Mintlify](https://www.mintlify.com/blog/simplifying-docs-with-llms-txt)など、Coding Agentをアクセスすると、HTMLではなく自動的に`llms.txt`を返してくれるようなドキュメントサービスも増えています。

## MCP Server

2024年後半から2025年にかけて、[MCP (Model Context Protocol)](https://modelcontextprotocol.io)が普及しました。
MCPは2023年6月にOpenAIから発表された function calling ( tool calling )の概念を標準化する形で提案されたプロトコルです。
2025年になって、Coding Agentに情報を与える手段として、Anthropic社から大々的に宣伝されたこともあり、ものすごい勢いでMCP Serverが増えていきました。
MCP Serverの素晴らしいところは、ひとたびMCPに沿った形でツールを定義すると、それが[`Claude Code`](https://code.claude.com/)でも[`Codex`](https://github.com/openai/codex)でも[`OpenCode`](https://opencode.dev/)でも[`amp code`](https://ampcode.com/)でも好きなCoding Agentでそれが使えるということです。

これまでにいろいろなタイプのMCP Serverが作られてきました。筆者も[`sitemcp`](https://github.com/ryoppippi/sitemcp)というMCP Serverを作成し、ドキュメントをMCP Server経由で提供する方法を提案しました。

libraryやframeworkの提供者がそれを使うための MCP Serverを個別に提供し始めています。

また独自の手法を用いてGitHubやlibraryの情報をいい感じに要約して返してくれるMCP Serverもあります。 [Deepwiki MCP](https://deepwiki.ai/mcp)、[Context 7](https://context7.com/)、[grep mcp](https://vercel.com/blog/grep-a-million-github-repositories-via-mcp)などはその最たる例です。

# 既存の方法の問題点

しかし、MCP Serverには大きな問題点がありました。

- [Coding Agentに登録できるMCP Serverの数には上限があります](https://www.reddit.com/r/cursor/comments/1k3pob9/mcp_server_40tool_limit_in_cursor_is_this/#:~:text=Limit%20Consequences:%20The%2040%2Dtool%20limit%20forces%20users,could%20lead%20to%20clunky%2C%20less%20functional%20tools.%22)。そのため、いろいろな情報を駆使してコーディングをさせたいときには、この上限が大きなネックになります。
- 多くのMCP Serverを登録すると、その定義だけでcontext windowを大きく圧迫することになります。1セッションあたりにこなせるタスク量が減ってしまいます。 このブログの趣旨とは違いますが、[例えば`Playwright` MCPをClaude Codeに接続しただけでほとんどのcontext windowを使い果たしてしまい、肝心の作業がほとんどできないといったことも起こっています](https://x.com/HclHno3/status/1982850594667933789)。
- MCP Serverが一度に返せる情報量には限りがあり、多くの情報を返そうと思うと、何度かやり取りをしなければならず、[N+1問題](https://planetscale.com/blog/what-is-n-1-query-problem-and-how-to-solve-it)が容易に発生します。[`sitemcp`でもこの問題に対処するためにPaginationを導入しました](https://github.com/ryoppippi/sitemcp/blob/716a4e6ff299cd9ef9aca7f7f3f458e6aff49cb8/src/server.ts#L166-L174)が、文字通りこれはN+1問題を引き起こしている例と言えるでしょう。

また、`llms.txt`にも共通する問題点として

- 毎回リモートにあるドキュメントを参照するのに時間もコストもかかる
- ドキュメントがバージョンごとに存在しているのは稀で、バージョンが古いlibraryを使っているときに情報のミスマッチが起きる
- 実際にCoding Agentが使うのは得られた情報の一部でしかないのにもかかわらず、取得したすべての情報をcontext windowに保持することになり、非常に効率が悪い

最後の問題に関しては、[Claude Code](https://code.claude.com/) は [Subagents](https://code.claude.com/docs/en/sub-agents) という仕組みを導入することで、部分的に解決しています。
しかし他の問題は残ります。

# 原点回帰: ローカルドキュメント

MCPが普及し始めた2025年4月ごろから、[MCPとCLIはどっちがいいんだ](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/)という議論が度々話題になっていました。Coding Agentもこの半年でいくつか世代を経るごとに、CLIツールの呼び出し方については、めきめきと精度が上がっていきました(これと比較して、[MCPなどのツール呼び出しの精度は実はあんまり上がってないんですよね...](https://gorilla.cs.berkeley.edu/leaderboard.html))。

これを踏まえると、できる限りドキュメントやlibraryのソースコードを手元に置いておくのがいいのではないかなというアイデアを自分の周りではより頻繁に聞くようになりました。
例えば友人である {@natsukium} は [`ghq`を使って使用しているlibraryをローカルにクローンして参照する](https://github.com/natsukium/dotfiles/blob/b1cef897b5142462103167a1a02ed4341cf80547/modules/home/coding-agents/common/AGENTS.md?plain=1#L64-L85)ように`CLAUDE.md`に指示を書いています。また、[`btca`](https://btca.dev/)というCLIツールでは、指定したlibraryを実際にGitHubからクローンしてきて、その情報を与えるための仕組みを整備していたりします。

一度手元にドキュメントをおいて仕舞えば、あとはCoding Agentが`fd`, `rg`などを使って必要な情報を探し出し、必要な部分だけを読み込んで処理すればよいわけです。
しかもわざわざリモートに情報を取りに行く必要もないわけですから、非常に効率的です。
repositoryにドキュメントが置いてあったとしても、それは大抵Markdownでしょう。2025年現在何かドキュメントを書くとした場合に、それがマークダウンでない確率の方が低いと考えられます。

# ドキュメントをpublishしよう

ローカルにドキュメントやコードを置いておくことは効果的であることは明らかです。
ではこの仕組みをどうやったら一般化できるでしょうか？
libraryの提供者はどうやれば最小手で自分のlibraryやframeworkをLLMフレンドリーにできるでしょうか?
上の方法では解決していないバージョンによる違いなどはどのように解決すればいいのでしょうか。

筆者は、library提供者が**ドキュメントを`npm` packageに同梱する。あるいは `@foo/docs` のような形でドキュメント専用packageを提供する**ことを提案します。(JavaScriptエコシステムの場合)

## なぜ`npm` packageなのか

`npm` packageとしてドキュメントを提供することにはいくつかの利点があります。

### ローカルへの自動配置

`npm`の大きな特徴として、インストールしたpackageが`node_modules`ディレクトリに実体として配置されることが挙げられます。
パスは常に`./node_modules/<package-name>`と予測可能で、Coding Agentが参照しやすい構造になっています。
ドキュメントを`npm` packageとしてpublishすれば、`npm install`するだけで自動的にプロジェクト内にドキュメントが配置されるのです。

### ドキュメント参照容易性

ドキュメントをCoding Agentに参照させるのは非常に簡単です。

```md
If you need to implement feature X, use the `@your-library` package.
Please refer to the documentation located at `./node_modules/@your-library/docs/**/*.md` for more information about how to use the library.
```

これをそのまま`CLAUDE.md`や`AGENTS.md`に書くこともできますし、より具体的には[`Agent Skills`](https://code.claude.com/docs/en/skills)の一つとして定義することで、必要に応じて参照させることもできるでしょう。

### 配布容易性

あなたがlibraryの作者である場合、ドキュメントとlibrary本体をモノレポで管理している場合がほとんどでしょう。その場合、ドキュメントを管理しているrepositoryを同時にバージョンを付けてpublishすることができます。
またすでにrepositoryにあるMarkdownをそのままコピーしてpublishするだけで完了するのでとても簡単です。

### バージョン管理容易性

新しいpackageをpublishするごとに、同時にドキュメントをpublishしていけば、ユーザーはlibraryとドキュメントのバージョンを合わせてダウンロードすることができます。
Coding Agentは、使用しているlibraryのバージョンに対応するドキュメントを**確実に**参照することができます。

## 実際の運用例

実はこの方法はすでにいくつかのlibraryで行われているものです。

### [`bun-types`](https://www.npmjs.com/package/bun-types)

[Bun](https://bun.sh/)はJavaScriptランタイムですが、その型定義を提供するために`bun-types`というpackageを提供しています。
このpackageにはBunの型定義だけでなく、[Bunのドキュメントも同梱されています](https://app.unpkg.com/bun-types@1.3.4/files/docs)。

また面白いことに`bun init -y`コマンドでプロジェクトを生成させると、`bun`は`CLAUDE.md`ファイルを自動生成します。その中には[Bunのドキュメントを参照する指示](https://github.com/oven-sh/bun/blob/e9e93244cb3fee8bc4d734e7a4f3f2883eb1bf4a/src/init/rule.md?plain=1#L111)が含まれています。

### [`gunshi`](https://github.com/kazupon/gunshi)

[gunshi](https://github.com/kazupon/gunshi) by {@kazupon} はTypeScriptでCLIツールを作成するためのlibraryです。自分が今もっとも愛用しているCLI libraryです。

[@preview](https://ryoppippi.com/blog/2025-08-12-my-js-cli-stack-2025-ja)

このlibraryは`gunshi` packageとは別に[`@gunshi/docs`](https://www.npmjs.com/package/@gunshi/docs)というドキュメント専用packageを提供しています。Coding Agentは`bun-types`と同様にこのドキュメントを参照することで、`gunshi`の使い方を学習することができます。
また、[`bunx @gunshi/docs`コマンドを叩くと、`CLAUDE.md`や`Cursor Rule`を自動生成してくれる仕組み](https://gunshi.dev/guide/introduction/setup#llm-assisted-development)も提供しています。

実際に `gunshi` のドキュメントを参照させた場合とWeb検索を使った場合を比較すると:

- コストは1.37USD -> 0.44 USD
- 実装は3:31 -> 0:40
- 手戻りも0回に！

などの効果がありました。

[@preview](https://github.com/ryoppippi/gunshi-docs-skills-benchmark/)

<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 300px;">
    <h3><code>@gunshi/docs</code>を使った場合</h3>
    <video controls width="100%">
      <source src="https://cdn.jsdelivr.net/gh/ryoppippi/gunshi-docs-skills-benchmark@main/docs/with-skills.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
  <div style="flex: 1; min-width: 300px;">
    <h3>Web検索のみ使用した場合</h3>
    <video controls width="100%">
      <source src="https://cdn.jsdelivr.net/gh/ryoppippi/gunshi-docs-skills-benchmark@main/docs/without-skills.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
</div>

### [`byethrow`](https://github.com/praha-inc/byethrow)

また同じく自分が愛用している新しいResult型libraryである[byethrow](https://github.com/praha-inc/byethrow) by {@Karibash} も同様に [`@praha/byethrow-docs`](https://www.npmjs.com/package/@praha/byethrow-docs) というドキュメント専用packageを提供しています。
`byethrow`は以前から`mcp`を提供していましたが、docs packageの方が高速に実装をすることができます。

# 注意点

この方法を採用する際にはいくつか考慮すべき点があります。

## packageサイズの増加

ドキュメントを同梱することで、当然packageのサイズは増加します。ただし、Markdownファイルはテキストベースであり、画像などを含めなければサイズの増加は限定的です。また、`@foo/docs`のように別packageとして提供する場合は、本体のサイズには影響しません。

## メンテナンスコスト

ドキュメントをpackageに含める場合、リリースのたびにドキュメントも一緒に更新・publishする必要があります。CIパイプラインを整備することで、このコストは最小化できます。
またモノレポで管理している場合、ドキュメントとコードのバージョンを同期させるのが容易です。

# おわりに

この1年間、`Context Engineering`という名前のもとで、どのようにドキュメントを整備して、LLMひいてはCoding Agentに渡すかということが広く議論されてきました。
筆者の中での現在の最適な方法は、ローカルにドキュメントを落とし、Coding Agentを信頼して、自由に情報を探索させることだと結論づけています。

`npm` registryへのドキュメントpublishは、それを推し進めるための良い解決策なのではないでしょうか。

# P.S.

<!-- ja: https://x.com/ryoppippi/status/1997459320091332729?s=20 -->
<!-- en: https://x.com/ryoppippi/status/1997456196723208373?s=20 -->
<Tweet id="1997459320091332729" />

<!-- https://x.com/kyutaro15/status/2000342747459485933?s=20 -->
<Tweet id="2000342747459485933" />
