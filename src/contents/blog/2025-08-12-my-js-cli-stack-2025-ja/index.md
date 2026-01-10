---
title: My JS CLI Stack 2025 (日本語)
date: '2025-08-12'
isPublished: true
lang: ja
---

<script>
import Tweet from '$components/Tweet.svelte';
</script>

こんにちは、ryoppippi です。はじめましての方ははじめまして。

この数年、OSSとして色々なCLIツールを作ってきました。

- [ccusage](https://ccusage.com/gh)
- [sitemcp](https://github.com/ryoppippi/sitemcp)
- [curxy](https://github.com/ryoppippi/curxy)
- [pkg-to-jsr](https://github.com/ryoppippi/pkg-to-jsr)
- [agentica](https://github.com/wrtnlabs/agentica/tree/2056405a31846775cdf3a1101ac356137247c2ab/packages/cli)
- [bunpare](https://github.com/ryoppippi/bunpare)

JSでは常に様々なライブラリが現れては消えていきます。自分も色々なものを試してきましたが、2025年現在のCLIツール開発において自分が使っているスタックを紹介します。

# 心がけていること

自分がOSSとしてCLIツールを作る際に心がけていることは以下の通りです。

- 型安全が保証されるようなライブラリを選ぶ
- バンドルサイズは小さければ小さいほどよい
- ドキュメントを充実させる
- 悪意のあるコードが混入しないように最大限配慮する

# Stack

## Package Manager

自分は [bun](https://bun.sh/) を使っています。理由は以下の通りです。

- **高速なインストール**: とにかくめちゃくちゃ速いです。localでもCIでも爆速に環境構築できます
- **TypeScriptがそのまま使える**: `bun run` コマンドでTypeScriptファイルを直接実行できるため、開発時の体験が向上します
- **優れた互換性**: nodeとの互換性がとても高く、互換性の問題で困ったことは今の所ありません
- **独自拡張が便利**: 特に [bun shell](https://bun.com/docs/runtime/shell) が便利です。簡単なスクリプトを書いたり `package.json` 内に shell scriptを書いて実行するのにとても便利です

モノレポとして使う場合は [pnpm](https://pnpm.io/) に軍配が上がっていましたが、最近 [pnpm style isolated install](https://bun.com/docs/install/isolated) の実装が進んでおり、これが安定すればbunでもモノレポが使いやすくなるでしょう。

## Bundler

現在は [tsdown](https://tsdown.dev/)を使っています。tsdown とは JS/TSのためのbundlerで、Rustで書かれた [rolldown](https://rolldown.rs/) をベースにしています。

rolldownは[rollup](https://rollupjs.org/)をRustで再実装することを目指しているプロジェクトです。まだ開発途中ではありますが、rollupの優れたtree shaking機能をRustの性能で実現することを目標としているため、将来性が期待できます。

なぜ tsdown を選んでいるかというと、以下の理由があります。

- **ビルドが爆速**: Rustベースのため圧倒的な速度
- **優れたtree shaking性能**: rollupの設計思想を継承しているため、esbuild や bun build よりも精度の高いtree shakingが期待できる
- **品質保証ツールとの連携**: [publint](https://publint.dev/) や [unplugin-unused](https://github.com/unplugin/unplugin-unused) など、packageの品質を保つためのツールとの連携が充実
- **rollupプラグインの互換性**: unplugin 系のプラグインがそのまま使えるのは大きなメリット
- **シンプルな設定**: 型生成やsource mapの生成も含めて、設定ファイルが非常にシンプル
- **継続的な改善**: rolldownの更新により、バンドルサイズの削減などの恩恵を受けられる

実際に bundle sizeやビルドの時間を比較してみると、[unbuild](https://github.com/unjs/unbuild)、[mkdist](https://github.com/unjs/mkdist)、[tsup](https://github.com/egoist/tsup)、[bun build](https://bun.sh/docs/bundler) よりも良い結果が得られています。

> 特にesbuildベースのものは [tree shakingの精度が低く、bundle sizeが大きくなりがち](https://github.com/evanw/esbuild/issues/1420)です。

実際、tsdownとrolldownの更新によってバンドルサイズが改善された例もあります：

<Tweet id="1954911556879388686" />

rolldownが登場するまでは bun build を愛用し、bun 用のpluginを作っていた時期もありますが、tsdown の方が便利だったので移行しました。

> 転職先でも大活躍です!
> <Tweet id="1941072675872641440" />

> 以前は`tsup`を度々使っていましたが、作者様も `tsdown` に乗り換えたようなので、今後は `tsdown`を使うことが多くなるでしょう。
> <Tweet id="1913448837441806564" />

## バンドル戦略

CLIツール配布時には、全ての依存パッケージをbundleして、dependenciesをゼロにしています。これには明確な理由があります。

- **インストール速度の向上**: dependenciesの解決は遅い。`bun` では高速ですが、`npm` や `deno` では顕著に遅くなります
- **効率的なコード配布**: tree-shakeにより実際に使用するコードのみを含められる。dependenciesとして配布すると不要なコードまでダウンロードすることになります
- **動作の安定性**: バージョンの不一致による不具合を回避。CLIツールのユーザは依存パッケージのバージョンを意識する必要がないため、ある時点のパッケージを全て内包することで動作を保証できます

実際にこの戦略により、配布サイズは大幅に削減されます。

<Tweet id="1911562801530777634" />

バンドルサイズを小さく保つために、ライブラリ選択時には以下を重視しています：

- なるべく小さく、依存が少ないもの
- tree shakingが効果的に働くもの
- 必要な機能を過不足なく提供するもの

例えば、ccusageはminifyをしていないにも関わらず、1MBを超えないようになっています。

[![install size](https://packagephobia.com/badge?p=ccusage@15.9.4)](https://packagephobia.com/result?p=ccusage@15.9.4)

また、よく使うツールに対してcontributeしてバンドルサイズを小さくする活動も行っています。

<Tweet id="1924053628370796715" />
<Tweet id="1911049580936143281" />
<Tweet id="1809345336177254439" />

## CLI Framework

これまでJS用は色々試してきました。

- [gunshi](https://gunshi.dev)
- [cleye](https://github.com/privatenumber/cleye)
- [cac](https://github.com/cacjs/cac)
- [citty](https://github.com/unjs/citty)
- [commander](https://github.com/tj/commander.js)

その中で、現在主に使っているのは {@kazupon} さんの gunshi です。

- **型安全なAPI**: [`parseArgs`](https://nodejs.org/api/util.html#utilparseargsconfig) likeなAPIで、型安全にコマンドライン引数をパース
- **充実した機能**: negatable、enum、alias、type checkingなどの機能が揃っている
- **小さなbundle size**: 他のフレームワークと比較して軽量
- **活発な開発**: pluginシステムなど革新的な機能の追加が進んでいる
- **将来性**: shell補完、i18n、helpのカスタマイズなどの開発も進行中

元々は `cleye` を使っていましたが、`gunshi`は似たインターフェースを保ちつつ、より軽量で高機能であることから移行しました。

+++ gunshiをcurxyで使用している例

https://github.com/ryoppippi/curxy/blob/7073bf01ce6c5b87f068d36bf3d9bb247af8f998/main.ts#L15C1-L90C4

```typescript
const command = define({
	toKebab: true,
	args: {
		endpoint: {
			type: 'custom',
			alias: 'e', // aliasの設定
			default: 'http://localhost:11434',
			description: 'The endpoint to Ollama server.',
			parse: validateURL, // validation 用のcustom function を設定可能
		},
		openaiEndpoint: {
			type: 'custom',
			alias: 'o',
			default: 'https://api.openai.com',
			description: 'The endpoint to OpenAI server.',
			parse: validateURL,
		},
		port: {
			type: 'number',
			alias: 'p',
			default: await getRandomPort(),
			description: 'The port to run the server on. Default is random',
		},
		hostname: {
			type: 'string',
			default: '127.0.0.1',
			description: 'The hostname to run the server on.',
		},
		cloudflared: {
			type: 'boolean',
			alias: 'c',
			default: true,
			negatable: true, // --cloudflared` オプションから `--no-cloudflared` を自動的に生成(https://gunshi.dev/guide/essentials/declarative-configuration#negatable-boolean-options)。
			description: 'Use cloudflared to tunnel the server',
		},
	},
	examples: ['curxy'].join('\n'),

	// 型安全な引数の型定義
	async run(ctx) {
		const app = createApp({
			openAIEndpoint: ctx.values.openaiEndpoint,
			ollamaEndpoint: ctx.values.endpoint,
			OPENAI_API_KEY,
		});

		await Promise.all([
			Bun.serve(
				{ port: ctx.values.port, hostname: ctx.values.hostname },
				app.fetch,
			),
			ctx.values.cloudflared
			&& startTunnel({ port: ctx.values.port, hostname: ctx.values.hostname })
				.then(async tunnel => ensure(await tunnel?.getURL(), is.String))
				.then(url =>
					console.log(
						`Server running at: ${bold(terminalLink(url, url))}\n`,
						green(
							`enter ${bold(terminalLink(`${url}/v1`, `${url}/v1`))} into ${
								italic(`Override OpenAl Base URL`)
							} section in cursor settings`,
						),
					)
				),
		]);
	},
});
```

+++

## Log

ログの表示は [consola](https://github.com/unjs/consola) を使っています。簡単にリッチなログを出力できるのが魅力的です。

- success、info、errorなどの豊富なログレベル
- boxやtableなどのリッチなログ出力
- promptを使った簡単なユーザ入力の取得

バンドルサイズの観点では最小ではありませんが、機能とのバランスを考えて選択しています。

より対話的なinterfaceが必要な場合は [`@clack/prompts`](https://github.com/bombshell-dev/clack)を使うこともあります。

## テスト

CLIツールのテストには [Vitest](https://vitest.dev/) を使っています。VitestはCLIツール開発において以下のような利点があります：

- **高いパフォーマンス**: native ES modulesサポートにより極めて高速に動作する
- **安全な環境変数のモック**: 環境設定に依存するCLIツールにとって重要な、安全で分離された環境変数のモックが可能
- **In-source testing**: `if (import.meta.vitest)` を使ってソースコードと直接並べてテストを書ける機能により、テストのためだけに関数をexportする必要がない

特にin-source testingは、CLIツールにとって価値があります。パブリックAPIを汚すことなく内部関数をテストでき、実装の詳細をプライベートに保ちながら包括的なテストカバレッジを確保できます。

# 配布について

## npm

パッケージの配布は`npm`にアップロードしています。

以前は {@jsr-io} に期待をしていました。JSRはビルド不要でTypeScriptをそのまま公開でき、自動的にドキュメントを生成してくれるなど魅力的な機能がありました。しかし、CLIツールの配布用途では以下の問題がありました：

- jsr上のツールを実行するには事実上 [deno](https://deno.com/) を使う以外の選択肢がない
- CLIツールのユーザは必ずしもdenoを使っているわけではない
- 自分でビルドプロセスやドキュメント生成を制御できる場合、JSRの利点が薄れる

そのため、汎用性を重視してnpmに戻りました。

## 安全性

`npx` での実行については度々セキュリティの懸念が指摘されています。そのため、[OIDC](https://docs.npmjs.com/trusted-publishers) による認証を行い、GitHub ActionsでのCI/CDを通じて、パッケージの安全性を明示しています。これによりユーザは、配布されているパッケージが信頼できるものであることを確認できます。

## `bunx` の推奨

<Tweet id="1954545309339574496"/>

`bunx`は、bunが提供するパッケージ実行ツールで、`npx`のbun版です。npmレジストリからパッケージを一時的にダウンロードして実行する機能を提供します。以下のような特徴があります：

自分のOSSでは、`npm` に上がっているCLIツールを実行する際には、[`bunx`](https://bun.com/docs/cli/bunx#shebangs) を使うことを推奨しています。また、自分のパッケージでは、基本的には `npm i -g <package>` のようなglobal installを推奨していません。

理由は以下の通りです：

- **高速なインストール**: `bun install`を用いているため、`deno npm:foo` や `npx -y foo` と比較して顕著に高速。特に依存パッケージが多いツールでその差が明確
- **互換性の維持**: [shebangにnodeが指定されているならばnodeで実行される](https://bun.com/docs/cli/bunx#shebangs)ため、実行時の互換性を保ちながらインストール時の高速化を享受
- **環境のクリーンさ**: キャッシュを `/private/tmp` に作成するため、ユーザ環境を汚染しない
- **自動更新**: キャッシュは24時間で自動的にrevalidateされるため、常に最新版を使用できる（global installに対する明確な優位性）

パッケージのバンドルサイズを適切に保ち、頻繁なバージョン固定が不要な用途では、`bunx foo` を用いたCLI実行は、ユーザの利便性とメンテナの負担軽減を両立できる選択肢です。特に`ccusage`のような頻繁に更新するCLIツールでは`bunx`による実行が最適だと信じています。

> 先日、[ 自分の知らないところで `ccusage` が `homebrew` に追加されたことがありました ](https://github.com/Homebrew/homebrew-core/pull/230656)が、自分としては推奨の方法ではないので Document にも追記していません。

# Document

基本的にはClaude Codeを使ってREADMEを充実させています。大規模になってきたら [vitepress](https://vitepress.dev/) を使ってドキュメントを作成することもあります。

vitepressは単なる静的サイトジェネレータではなく、以下の点で優れています：

- [`typedoc`](https://typedoc.org/) との連携
- `llms.txt` の生成などの機能をpluginとして追加可能
- [`shiki`](https://shiki.js.org/) を使った美しいコードハイライト

# その他のツール

- [bumpp](https://github.com/antfu-collective/bumpp): semantic versioningを簡単に行うためのツール
- [publint](https://publint.dev/): パッケージの品質を保つためのツール
- [clean-pkg-json](https://github.com/privatenumber/clean-pkg-json): publish前に余計なpackage.jsonのfieldを削除
- [changelogithub](https://github.com/antfu/changelogithub): 綺麗なGitHub Releaseを作成
- [renovate](https://docs.renovatebot.com/): 依存パッケージの更新を自動化。細かく設定でき、自動マージも可能
- [eslint](https://eslint.org/): コードの品質を保つためのツール。contributorが少ない場合は [biome](https://biomejs.dev/) を使うが、多くなってくるとルールで縛る方がレビューが楽になる。ルールは [@ryoppippi/eslint-config](https://github.com/ryoppippi/eslint-config)で管理。[oxlint](https://oxc.rs/docs/guide/usage/linter)のtype-aware ruleの開発に期待
- [pkg-pr-new](https://pkg.pr.new/): commitごとにnpm互換のregistryにpackageを自動でpublish。手元で試すのが楽
- [bun-only](https://www.npmjs.com/package/bun-only): `bun` のみで動作するツールを作った時に使用

# まとめ

2025年現在のCLIツール開発において、自分が使っているスタックを紹介しました。振り返ってみると、改めて色々なライブラリやエコシステムに支えられて開発を進めていることを実感します。

これからも新しいライブラリやツールが登場することで、CLIツール開発がより便利になっていくことを期待しています。

# 追記

もし [ccusage](https://ccusage.com/) の内部を知りたい方は、[deepwiki](https://deepwiki.com/ryoppippi/ccusage)をご覧ください。
