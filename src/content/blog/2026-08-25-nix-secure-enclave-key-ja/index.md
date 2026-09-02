---
permalink: /blog/2026-08-25-nix-secure-enclave-key-ja
title: nix-secure-enclave-keyを作った
date: "2026-08-25"
isPublished: true
lang: ja
---

<NotByAI />

> [!NOTE]
> mizdraさんのblogを読んで一瞬で作ったものの、旅行等々ありblogが遅れてしまった

久しぶりにwrapperでもなくただただ自分のためにめちゃくちゃ便利な物を作ったので紹介。

<OgCard url="https://github.com/ryoppippi/nix-secure-enclave-key" />

# Secretiveは最高だが辛い

<!-- https://x.com/matsuu/status/1543404742411698176?s=20 -->
<Tweet id="1543404742411698176" />

自分はgit commitの署名やssh keyの管理に[Secretive](https://github.com/maxgoedjen/secretive)を使ってなんだかんだ4年くらいが経った。

基本的に自分はprivate keyを極力管理したくない。`~/.ssh`に置いたりするのは論外だし、1Passwordに登録するとしても一度generateするのが面倒である。

Secretiveとは、macOSのSecure Enclaveを使ってssh keyやgpg keyを管理するツールである。keyを生成するとprivate keyはSecure Enclaveに格納され、自分を含め誰もkeyにアクセスすることができない。つまり、private keyが漏洩する心配がない!!最高!
Secretive appに表示されるpublic keyをGitHubやremote serverに登録することで、そのマシンからのみ署名やssh接続が可能になる。最高である。

基本的にはこのコンセプトが大好きでずっと使ってきたが、不満がないわけでもなかった。

- Secretive Appから Port による接続が必要なのだが、GUIがよく死んでいることがあり、そこで署名が詰まる
- Login状態でのみ署名が可能なので、一度macがsleepすると署名ができず、coding agentと相性がすこぶる悪い
- **SecretiveはGUIアプリであり、CLIから操作できない**
  - 毎回マシンをセットアップする際にマウスでぽちぽち、GitHub Configを開いてポチポチ、がだるすぎる
  - 仕事とprivateのマシンでどっちもあるとだるい
  - 転職が多い人間にとって大変....
  - 設定が **Declarativeでない**

特にほぼ全ての設定を[dotfiles](https://github.com/ryoppippi/dotfiles) で管理している自分にとって、Secretiveの設定を管理できないのは苦痛で仕方なかった。
[CLIについてはissueが長らく存在しているが](https://github.com/maxgoedjen/secretive/issues/328)進む気配もなさそうである。

# 救世主mizdra、そして `sc_auth create-ctk-identity`


8月頭に {@mizdra} さんが書かれていた記事の中で、Secure Enclave 内に鍵を生成するCLIがあることが紹介されていた。

<OgCard url="https://www.mizdra.net/entry/2026/08/07/101542" />

詳しくは記事に譲るとして、

```sh
sc_auth create-ctk-identity -l git-sign -k p-256-ne -t none
```

でkeyを生成することができる。また、`-t` optionで認証の有無まで指定できる。
これでCLIからSecure Enclave内にkeyを生成することができるようになった。

しかし、このblog記事の手順を毎回手作業で実行したり、`~/.ssh/config`や`gitconfig`、GitHubの設定を手作業で行うのは面倒である。というかだるすぎる。
自分はdotfilesをnix&nix-darwinで管理している。そのため基本は`git clone`して`nix run .#switch`をするだけでセットアップが完了する。
ssh keyもその仕組みに乗っかってほしいのだが、これを実現しているOSSは存在しなかった。というわけで [nix-secure-enclave-key](https://github.com/ryoppippi/nix-secure-enclave-key) を作った。

# nix-secure-enclave-keyの何が嬉しいのか

手作業からの解放！全てnixで宣言的に管理できるのが本当に嬉しい。

- `nix run .#switch`でSecure Enclaveのidentity生成、ssh config、gitconfigまで終わる
- 認証済みの`gh`があれば、`gh ssh-key add`でGitHubのauthentication keyとsigning keyも登録できる
- 同じdotfilesをMac間で同期しつつ、鍵は各MacのSecure Enclaveに固有のものを作れる
- 署名用はTouch IDなし、リモートサーバー用はTouch IDあり、とidentityを用途別に分けられる

Secure Enclaveの鍵をdeclarativeに管理できるようにしたのが、このprojectの新しいところである。

## 仕組み

このmoduleがやることは単純である。

1. `sc_auth`でSecure Enclaveのidentityを作る
2. そのidentityに対応するSSHのstub/referenceを`~/.ssh`に置く
3. SSHとGitにそのファイルとproviderを設定する

`~/.ssh/id_enclave_key`に秘密鍵が入るわけではない。秘密鍵はEnclaveから出ず、ファイルには対応するidentityを呼び出すための情報だけが入る。だから同じidentityをGitHubへのSSH認証、commit署名、サーバーへのログインに使える。

### activationで鍵を扱う

生成のたびに固有の値を持つ鍵そのものはNixに書けない。宣言できるのは「このlabelのidentityが存在してほしい」という状態までである。activationはidentityとstubを確認し、なければ作る`ensure`として動く。既存の鍵は削除しない。

nix-darwinのactivationはrootで動くので、そのまま鍵を作るとrootのidentityになる。Secure Enclaveの鍵はログインユーザーに紐づくため、moduleは`system.primaryUser`で指定されたユーザーとしてidentityの作成とGitの設定を実行する。

GitHubへの登録には`gh ssh-key add`を使う。`github.autoAdd`を有効にし、初回だけ`gh`に必要なscopeを追加する。

```sh
gh auth refresh --hostname github.com --scopes admin:ssh_signing_key,admin:public_key
```

scopeが足りない場合はactivationを止めず、手動実行用のコマンドを表示する。

## 宣言をMac間で同期する

dotfilesで同期するのは鍵そのものではなく、label、用途、protectionなどの宣言である。各Macでは固有のidentityを作り、GitHubのtitleにMac名とfingerprintを入れて区別する。

## 設定例

実際に自分の[dotfilesで使っている設定](https://github.com/ryoppippi/dotfiles/blob/d6d58043b3220283edd416b7e35ddcef9f417c8e/flake.nix#L629-L646)は以下の通り。

```nix
{
  programs.nix-secure-enclave-key = {
    enable = true;
    identities = {
      git-signing = {
        keyFile = "~/.ssh/id_enclave_key";
        label = "nix-secure-enclave-key";
        protection = "none";
        autoEnsure = true;
        github = {
          autoAdd = true;
          type = "both";
        };
      };
    };
    signingIdentity = "git-signing";
    signByDefault = true;
  };
}
```

その他の設定例は[README](https://github.com/ryoppippi/nix-secure-enclave-key)を参照してほしい。

Secretiveから移行する場合はrepositoryに[移行ガイド](https://github.com/ryoppippi/nix-secure-enclave-key/blob/main/docs/secretive-migration.md)を置いてあるので、AIに読ませて移行を頼むとよい。

# まとめ

2週間ぐらい運用してるが、特に問題なく動いている。
Secretive Appを使っていた時のようにたまにhangしたり、logoutでgit commitできない、という問題が消えて快適である。
また、sshでremote loginするときも、touch idやapple watchで認証してくれる安全性はそのまま享受できていて、求めていたものという感じで最高。

# 捕捉

ryoppippi調査によれば、この辺りは SeKey → Secretive → sc_auth → mizdraさんの記事 → nix-secure-enclave-key という系譜になっている。詳しく気になる人は以下のpromptをAIに投げて調べてもらうとよい。

```text
SeKey → Secretive → sc_auth → mizdraさんの記事 → nix-secure-enclave-key の流れを説明してください。加えて、nix-secure-enclave-keyの新規性がどこにあるのかも教えてください。
```
