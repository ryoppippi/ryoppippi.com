---
title: "CopilotChatとNeovimでGitの効率を上げる"
date: '2024-06-10'
isPublished: true
lang: 'ja'
---

> [!NOTE]
> この記事は[Vim 駅伝](https://vim-jp.org/ekiden/)の 6/10 の記事です。

# LazygitでCommit Messageを作成する

最近Git Commit Messageを[CopilotChat.nvim](https://github.com/CopilotC-Nvim/CopilotChat.nvim)に生成してもらっているのですが、その際の便利設定を紹介します。

CopilotChat.nvimについて詳しくは以下の記事を参照してください。
https://zenn.dev/nabekou29/articles/neovim-lazygit-commit-message

https://github.com/ryoppippi/dotfiles/blob/122370847176e62b17dc6c216a4488226e9cf075/nvim/after/ftplugin/gitcommit.lua#L99-L110

これは何をしているかというと

- `ftplugin/gitcommit.lua`に`CopilotChat`の設定を追加
- `gitcommit`のバッファが開かれた時に`CopilotChat`を自動で起動

こうしておくことで

- shell commandで`git commit`を実行するとNeovimが立ち上がる
- `CopilotChat`が自動で起動してCommit Messageを生成してくれる
- `c-y`で生成されたCommit MessageをBufferに貼り付ける。気に入らなかったら `<leader>c`で再生成
- `:qq`でBufferの保存とNeovimの終了をする。Commitが作成される

という流れでGitの効率を上げることができます。

また以前書いた記事では、`git commit`でNeovimが立ち上がる時に一緒にgit hooksを実行してくれるようにしています。
こちらと合わせて使うと便利でしょう。

/blog/2023-08-16-zenn-3b5125f9e06bf9-ja

# git diffからPull Requestのコメントを作成する

Pull Request(以下PR)の文章も楽に生成させたいですよね。

そんなときは以下のようにするととても便利です。

用意するのは

- [gh](https://github.com/cli/cli)
- [Gin](https://github.com/lambdalisue/vim-gin)

です。

まず、`gh`でPRを作成します。

```shell
gh pr create --title "PR Title"
```

すると、bodyを入力するためにNeovimが立ち上がることでしょう。

ここで

```
:GinDiff main
```

とすると、mainブランチとの差分が表示されます。

これを全て選択して

```
:'<,'>CopilotChat generate PR desc from this diff to the main
```

を実行すると、差分からPRの文章を生成してくれます。

![0.png](./0.png)

これをyankしてPR bodyのBufferに貼り付け、修正が必要な部分を修正して、Neovimを閉じるとPRが作成されます。
とっても楽ですね！

もし`Gin`を使わない場合は

```
:new
:r! git diff main
```

で差分をvimに取り込めるので、同様に`CopilotChat`を使ってPRの文章を生成できます。

# まとめ

CopilotChat便利
