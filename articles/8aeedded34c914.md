---
title: "Neovim 0.8以降のビルトインLSPについて"
emoji: "✍️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["neovim","lsp"]
published: true
published_at: 2023-04-26 09:00
---

::: message 
この記事は[Vim駅伝](https://vim-jp.org/ekiden/)の4/25の記事です。
:::

実はNeovim 0.8以降でいろいろと進化したLsp on Neovimについての記事がなかったので、書いてみます。

長らくNeovimでLSPを導入するにはnvim-lspconfigを使うことが推奨されてきました。
というか、nvim-lspconfigを使う前提の解説がほとんどでした。

https://github.com/neovim/nvim-lspconfig

これを使うとLSPの設定を簡単に行うことができます。
例えば、luaのサーバーである`lua_ls`を使う場合は以下のように設定します。

```lua
local lspconfig = require("lspconfig")

lspconfig.lua_ls.setup({})
```
この設定を行うことで、luaのファイルを起動すれば自動的にサーバーが立ち上がり、luaファイルのバッファに対して補完やDiagnosticなどの処理を行ってくれます。
またバッファを閉じればサーバーも自動的に閉じます。


今回はnvim-lspconfigではなく、Neovim 0.8以降にLSPに関していくつかの標準搭載された機能を紹介していきます。

::: message alert
ちなみに執筆時点でのNeovimの最新の安定バージョンは0.9.0です。
:::


# LspAttach/LspDetach
これがユーザーにとっては大きな影響を持つと思います。

Neovim 0.8より、`LspAttach`、そして`LspDetach`という`autocmd`が追加されました。

LspAttachは、LSP Serverが開いたBufferにAttachされたときに発火します。
これをうまく使うと、設定ファイルを書くのが楽になります。

前述の通り、Neovim 0.7以前では、nvim-lspconfigの`on_attach`オプションに関数を渡していました。
つまり、lsp serverに関する設定を１箇所にまとめる必要があったのです。
そのため、設定ファイルに巨大な`on_attach`関数を書いていました(keymapから外部プラグインの設定から)。


```lua
local lspconfig = require("lspconfig")

function setKeymap(client, bufnr)
  vim.keymap.set('n', 'gd', '<cmd>lua vim.lsp.buf.definition()<CR>', { silent = true, buffer = bufnr }) -- キーマップを設定する
end

function setPlugin(client, bufnr)
  require("illuminate").attach(client, bufnr) -- 外部プラグインをlsp serverを連携させる
end

function on_attach(client, bufnr)
  setKeymap(client, bufnr)
  setPlugin(client, bufnr)
end

lspconfig.lua_ls.setup({
  on_attach = on_attach
})
```


これが、LspAttachが追加されたことで、設定ファイルをうまく分割することができるようになりました。
試しに書いてみましょう。

```lua
local lspconfig = require("lspconfig")

function on_attach(on_attach)
  vim.api.nvim_create_autocmd("LspAttach", {
    callback = function(args)
      local buffer = args.buf
      local client = vim.lsp.get_client_by_id(args.data.client_id)
      on_attach(client, buffer)
    end,
  })
end

on_attach(function(client, bufnr)
  vim.keymap.set('n', 'gd', '<cmd>lua vim.lsp.buf.definition()<CR>', { silent = true, buffer = bufnr }) -- キーマップを設定する
end)

on_attach(function(client, bufnr)
  require("illuminate").attach(client, bufnr) -- 外部プラグインをlsp serverを連携させる
end)

lspconfig.lua_ls.setup({})
```

上のコードでは、`on_attach`関数でautocmdをラップして使いやすくしています。
0.7以前のコードと違って、このラップ関数を用いればLSP Server起動時の処理を設定ファイルのどこに書いても良くなりました。

自分はlazy.nvimを用いてプラグインを管理しています。そして設定ファイルはプラグインごとに分割しています。
そのため、`LspAttach`を用いることで綺麗に設定ファイルを分割することができました。

https://github.com/ryoppippi/dotfiles/blob/1c1a2e4c7759fadff15612e20a6025e1db40114c/nvim/lua/plugin/vim-illuminate.lua


また、LspDetachはLSP Serverが開いたBufferからDetachされたときに発火します。
これのうまい使い所は... 今のところ思いついていません。誰か教えて下さい


# vim.lsp.start/vim.lsp.buf_attach_client
Neovim 0.8以降では、`vim.lsp.start`、そして`vim.lsp.buf_attach_client`という関数が追加されました。
この2つは
- `vim.lsp.start`: LSP Serverを起動する
- `vim.lsp.buf_attach_client`: LSP ServerをBufferにAttachする

実は、現在のnvim-lspconfigは、この２つの関数をラップしたものになっています。
先ほどの例にあった`lspconfig.lua_ls.setup({})`では、これらの関数をうまいこと駆使して、Bufferの種類によって最適なサーバーを選んで起動し、プロセスを管理してくれます。

しかし、中には一部挙動が気に食わない場面も出てくるかもしれません。
そんな時に、`vim.lsp.start`をそのまま呼び出すことで、完璧にLSPを制御できるかもしれません。

以下にlua_lsの設定例を示します。

```lua
vim.api.nvim_create_autocmd('FileType', {
  pattern = 'lua',
  callback = function()
    vim.lsp.start({
      name = 'lua_ls',
      cmd = {'pylsp'},
      capabilities = vim.lsp.protocol.make_client_capabilities(),
      cmd = {'lua-language-server'},
      root_dir = vim.fs.dirname(vim.fs.find({'.git'}, { upward = true })[1]),
    })
  end,
})
```

このように、`Filetype`のautocmdを用いて、`lua`ファイルが開かれたときに`lua_ls`を起動しています。  
また、`ftplugin/python.lua`というファイルを作成して、そこに設定を書くこともできますね。

メリット・デメリットは以下の通りです。

メリット
- 挙動をコントロールできること

デメリット
- 有効にするファイルの種類から、root判定のファイルの指定、さらにそもそものLSP Serverの起動コマンドの指定までが必要になること

nvim-lspconfigはこの設定が大変な部分をうまくやってくれているので、基本的にはnvim-lspconfigを使うのが良いと思います。
ただ、一部自分にとっても気に食わない部分があるので(tsserverとdenolsの共存等)、その部分のみ`vim.lsp.start`を使うのが良いかなと思います。
(このtsserverとdenolsの共存にに関してはnvim-lspconfigのroot_patternを使う方法もありますが、必ずしもうまくいくとは限りません。

# まとめ
Neovim 0.8以降で可能なLSPの設定方法を紹介してみました。
参考になれば幸いです。

# 参考文献
- https://vonheikemen.github.io/devlog/tools/manage-neovim-lsp-client-without-plugins/
- https://zignar.net/2022/10/01/new-lsp-features-in-neovim-08/




