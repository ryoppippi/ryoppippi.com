---
title: "Fish Shellの設定ファイルを見直して起動時間を 470ms -> 14.7ms に短縮した話"
date: '2023-09-17'
isPublished: true
lang: 'ja'
---

# はじめに

数日前にこのような記事を見かけました。

https://zenn.dev/fuzmare/articles/zsh-plugin-manager-cache

この記事ではZshの起動時間を大幅に短縮する方法が紹介されています。

さて、自分はここ数年(というかコードを書き始めてからずっと)、[ Fish Shell ](https://fishshell.com)を使っています。
Fish Scriptがとても書きやすく、補完がとても優秀なのでずっと気に入って使ってます。
しかし、起動時間が遅いなとなんとなく感じていたので、この機会に設定を見直してみました。

<details>
<summary>自分自身のマシン環境</summary>

```fish
➜ neofetch
                    'c.          ryoppippi
                 ,xNMM.          ------------------------------------
               .OMMMMo           OS: macOS 13.5.1 22G90 arm64
               OMMM0,            Host: Macmini9,1
     .;loddo:' loolloddol;.      Kernel: 22.6.0
   cKMMMMMMMMMMNWMMMMMMMMMM0:    Uptime: 3 days, 2 hours, 53 mins
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.    Packages: 1 (brew)
 XMMMMMMMMMMMMMMMMMMMMMMMX.      Shell: fish 3.6.1
;MMMMMMMMMMMMMMMMMMMMMMMM:       Resolution: 2560x1080, 1080x1920
:MMMMMMMMMMMMMMMMMMMMMMMM:       DE: Aqua
.MMMMMMMMMMMMMMMMMMMMMMMMX.      WM: Rectangle
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.    Terminal: WezTerm
 .XMMMMMMMMMMMMMMMMMMMMMMMMMMk   CPU: Apple M1
  .XMMMMMMMMMMMMMMMMMMMMMMMMK.   GPU: Apple M1
    kMMMMMMMMMMMMMMMMMMMMMMd     Memory: 3159MiB / 16384MiB
     ;KMMMMMMMWXXWMMMMMMMk.
       .cooc,.    .,coo:.

```

</details>

# 最適化の流れ

それでは、いかにして起動時間を短縮したかを見ていきます。

## 最適化前

<details>
<summary>設定</summary>

https://github.com/ryoppippi/dotfiles/blob/7289a3bfe61b4ab53fac3348ac25f957369f208b/fish/config.fish
https://github.com/ryoppippi/dotfiles/blob/7289a3bfe61b4ab53fac3348ac25f957369f208b/fish/fish_plugins

</details>

まずは現状の起動時間を計測してみます。

```fish
❯ hyperfine -w 5 -r 50 'fish -i -c exit'
Benchmark 1: fish -i -c exit
  Time (mean ± σ):     465.4 ms ± 128.8 ms    [User: 177.8 ms, System: 83.8 ms]
  Range (min … max):   411.2 ms … 1203.2 ms    50 runs
```

... おっそ。
いくつか心当たりはあります。なので、それを順番に見ていきます。

## .bash_profileの読み込みをやめる

これまでの自分の設定では、

- 環境変数/Path等の設定を`.bash_script` に記述
- `.bash_script` を[bass](https://github.com/edc/bass)というfish pluginを使って `config.fish` から読み込む

という運用をしていました。

https://github.com/ryoppippi/dotfiles/blob/7289a3bfe61b4ab53fac3348ac25f957369f208b/fish/config.fish#L1-L3

<details>
<summary>.bash_profile</summary>

https://github.com/ryoppippi/dotfiles/blob/7289a3bfe61b4ab53fac3348ac25f957369f208b/bash/.bash_profile

</details>

なぜこうしていたかといえば、Fish Scriptはposix準拠ではないからです。
後々bash/zsh等のposix準拠なシェルに移行しやすいように、環境変数やPath等のシェル間で使いまわせそうな設定は`.bash_profile`に記述していました。

とはいえ、昨今の状況を踏まえると、わざわざfishとbash/zsh scriptを併用する意味は薄いと考えました。理由としては、

- 現状fishから移行する予定は当分ない
- Fish Scriptの方が書きやすい
- もし移行する必要に迫られたとしても、ChatGPT等のLLMに変換してもらえばいい

ということで、`.bash_profile`の読み込みをやめ、全ての設定を`config.fish`に移行しました。

```fish
❯ hyperfine -w 5 -r 50 'fish -i -c exit'
Benchmark 1: fish -i -c exit
  Time (mean ± σ):     329.9 ms ±  16.5 ms    [User: 121.4 ms, System: 70.4 ms]
  Range (min … max):   313.7 ms … 419.9 ms    50 runs
```

これだけで150ms 程度短縮できました。
bashのプロセスをfishから起動するのにかかっていた時間や、`.bash_script`と`config.fish`で重複していた処理を削減できたことが大きかったようです。

## Starshipをやめる

[Starship](https://starship.rs)は、fish/zsh/bashの見た目をカスタマイズするためのツールです。
Starshipは設定をほぼ書かずに綺麗なプロンプトを作ることができるので、とても人気があります。
自分も長らくこれを使っていました。
しかし、試しにこれを抜いてみると、起動時間が大幅に短縮されました。

```fish
➜ hyperfine -w 5 -r 50 'fish -i -c exit'
Benchmark 1: fish -i -c exit
  Time (mean ± σ):     228.6 ms ±   5.1 ms    [User: 95.8 ms, System: 57.4 ms]
  Range (min … max):   222.2 ms … 249.4 ms    50 runs
```

なんと100ms以上短縮されました。
正直、Starship以外にもpure Fish Scriptで書かれたプラグインがいくつもあるので、それに乗り換えることにしました。
自分はいくつかのプラグインを試した後、[spacefish](https://github.com/matchai/spacefish)に落ち着きました(皮肉なことに、このspacefishはPublic Archiveされており、開発者はStarshipへの移行を推奨していますが、すんなり動いたのでそのまま使っています)。

## `franciscolourenco/done` をやめる

[franciscolourenco/done](https://github.com/franciscolourenco/done)は一定時間以上かかるコマンドが終了したときに通知を出してくれるfish pluginです。
おすすめのfish plugin として紹介されることも多く、自分自身長らく使っていましたが、こちらも起動時間に影響があることが判明しました。
そこで、この機能自体を自前実装することにしました。

https://github.com/ryoppippi/dotfiles/blob/b40e4e6ddd6ee7c5be8786d280df4be6f7c2be00/fish/user_functions/fish_right_prompt.fish

```fish
➜ hyperfine -w 5 -r 50 'fish -i -c exit'
Benchmark 1: fish -i -c exit
  Time (mean ± σ):     217.9 ms ±  18.8 ms    [User: 87.4 ms, System: 50.5 ms]
  Range (min … max):   204.9 ms … 319.5 ms    50 runs
```

これでさらに10ms 程度短縮できました。

## 処理の一部をBackgroundで動かす

Fish Scriptは、関数の最後に `&` をつけることでBackground で処理を動かすことができます。
これを使って、起動時に必要な処理の一部をBackgroundで動かすことにしました。
https://github.com/ryoppippi/dotfiles/commit/d27d1bc64610d70d5436acda25e67a9445d3d755

```fish
➜ hyperfine -w 5 -r 50 'fish -i -c exit'
Benchmark 1: fish -i -c exit
  Time (mean ± σ):     206.7 ms ±   7.4 ms    [User: 85.0 ms, System: 47.9 ms]
  Range (min … max):   198.5 ms … 233.7 ms    50 runs
```

またまた10ms 程度短縮できました。

## メインディッシュ: cacheを実装する

ここまでで、起動時間は200ms程度まで短縮されました。
しかし、まだまだ遅いです。

原因を探ってみると、外部コマンドを叩いている部分がボトルネックになっていることがわかりました。
自分の`config.fish` では、以下のコマンドが呼ばれていました。

- `xcode-select`
- `brew`
- `gem`
- `direnv`
- `zoxide`
- ~~`starship`(一応上の項で削除済み)~~

そこで、先のZshの記事を参考に、cache を実装することにしました。

https://github.com/ryoppippi/dotfiles/blob/96a3cdcf8442bffa2525229e7a5fe70515bae1d7/fish/config.fish#L99-L120

念の為コードの流れを解説すると、

- `config.fish`の更新日時が`~/.cache/fish/config.fish` の更新日時より新しい場合、または`~/.cache/fish/config.fish`が存在しない場合、cache を更新する
- 外部コマンドの実行結果を`~/.cache/fish/config.fish` に保存する
- `~/.cache/fish/config.fish` を読み込む

とすることで、cache が存在する場合は外部コマンドを実行せずに済むようにしました。

この結果、

```fish
➜ hyperfine -w 5 -r 50 'fish -i -c exit'
Benchmark 1: fish -i -c exit
  Time (mean ± σ):      14.7 ms ±   0.6 ms    [User: 9.4 ms, System: 4.3 ms]
  Range (min … max):    13.9 ms …  16.2 ms    50 runs
```

なんと起動時間が **14.7ms** にまで短縮されました！
一気に190ms 程度短縮できました。
やったね！

<details>
<summary>ちなみに</summary>

念の為、cache の結果をファイルではなく `set -U CACHE` などと環境変数に保存する方法も試してみました。
しかし予想に反して、手元の環境ではファイルに保存する場合と速度に大差がありませんでした。
また、更新のタイミングを決定するコードが煩雑になりそうでした（環境変数に保存する場合は現在の時刻を別個保存する必要があるが、ファイルに保存する場合は[`test`](https://fishshell.com/docs/current/cmds/test.html)コマンドを用いてファイルの更新日時を比較すればいいだけなので実装が容易）。
そのため、`~/.cache` 以下にcache ファイルを保存することにしました。

</details>

# まとめ

以上のように、設定を見直すことで、Fish Shellの起動時間を470ms -> 14.7 ms にまで短縮することができました。
Zshの高速化で必須とされる遅延読み込みや`zcompile`による最適化といったテクニックを一切使わずに、これだけの高速化ができたのは驚きでした。
Fish Scriptの実行速度が十分に速いおかげかもしれません。
[Fish自体の実装をC++からRustに移行する](https://twitter.com/yutkat/status/1661982003036827649)計画も進んでいるので、今後さらに高速化するかもしれないと考えるとワクワクしますね！

<details>
<summary>最終的な設定</summary>

https://github.com/ryoppippi/dotfiles/blob/6f56dc22da020c9e4f24c2e7204a1535d2b7f746/fish/config.fish
https://github.com/ryoppippi/dotfiles/blob/7289a3bfe61b4ab53fac3348ac25f957369f208b/fish/fish_plugins

</details>
