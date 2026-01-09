---
title: "Neovim 0.8以降のビルトインLSPについて"
emoji: "✍️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["neovim", "lsp"]
published: true
published_at: 2023-04-26 09:00
---

::: message
この記事は[Vim 駅伝](https://vim-jp.org/ekiden/)の 4/26 の記事です。
:::

実は Neovim 0.8 以降でいろいろと進化した LSP on Neovim についての記事がなかったので、書いてみます。

長らく Neovim で LSP を導入するには nvim-lspconfig を使うことが推奨されてきました。
というか、nvim-lspconfig を使う前提の解説がほとんどでした。

https://github.com/neovim/nvim-lspconfig

これを使うと LSP の設定を簡単に行うことができます。
例えば、lua のサーバーである`lua_ls`を使う場合は以下のように設定します。

```lua
local lspconfig = require("lspconfig")

lspconfig.lua_ls.setup({})
```

この設定を行うことで、lua のファイルを起動すれば自動的にサーバーが立ち上がり、lua ファイルのバッファに対して補完や Diagnostic などの処理を行ってくれます。
またバッファを閉じればサーバーも自動的に閉じます。

今回は nvim-lspconfig ではなく、Neovim 0.8 以降に LSP に関していくつかの標準搭載された機能を紹介していきます。

::: message alert
ちなみに執筆時点での Neovim の最新の安定バージョンは 0.9.0 です。
:::

# LspAttach/LspDetach

これがユーザーにとっては大きな影響を持つと思います。

Neovim 0.8 より、`LspAttach`、そして`LspDetach`という`autocmd`が追加されました。

LspAttach は、LSP Server が開いた Buffer に Attach されたときに発火します。
これをうまく使うと、設定ファイルを書くのが楽になります。

さて、Neovim 0.7 以前で LSP Server の Attach 時に何か処理を行いたい場合は、nvim-lspconfig の`on_attach`オプションに関数を渡していました。
つまり、巨大な`on_attach`関数を書いて、それを渡す必要があったのです(keymap から外部プラグインの設定から)。
そのため、LSP Server 起動時の設定は LSP の設定とまとめて１箇所に記述しなければなりませんでした。

```lua
local lspconfig = require("lspconfig")

-- キーマップを設定する
function setKeymap(client, buffer)
  vim.keymap.set('n', 'gd', '<cmd>lua vim.lsp.buf.definition()<CR>', { silent = true, buffer = buffer })
end

-- 外部プラグインをlsp serverを連携させる
function setPlugin(client, buffer)
  require("illuminate").attach(client, buffer)
end

function on_attach(client, buffer)
  setKeymap(client, buffer)
  setPlugin(client, buffer)
end

lspconfig.lua_ls.setup({
  on_attach = on_attach
})
```

しかも、この`on_attach`関数は、LSP Server ごとに設定する必要がありました。
まあめんどくさいですよね。

これが、LspAttach が追加されたことで、設定ファイルをうまく分割することができるようになりました。
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

-- キーマップを設定する
on_attach(function(client, buffer)
  vim.keymap.set('n', 'gd', '<cmd>lua vim.lsp.buf.definition()<CR>', { silent = true, buffer = buffer })
end)

-- 外部プラグインをlsp serverを連携させる
on_attach(function(client, buffer)
  require("illuminate").attach(client, buffer)
end)

lspconfig.lua_ls.setup({})
```

上のコードでは、`on_attach`関数で autocmd をラップして使いやすくしています。
0.7 以前のコードと違って、このラップ関数を用いれば LSP Server 起動時の処理を設定ファイルのどこに書いても良くなりました。
また、LSP Server ごとに設定する必要もなくなりました。
特定の LSP Server に対して何か特別に処理を行いたい場合は、`on_attach`関数の引数を使って`client.name == 'lua_ls'`などのような条件分岐を使うこともできます。

自分は lazy.nvim を用いてプラグインを管理しています。そして設定ファイルはプラグインごとに分割しています。
そのため、`LspAttach`を用いることで綺麗に設定ファイルを分割することができました。

https://github.com/ryoppippi/dotfiles/blob/1c1a2e4c7759fadff15612e20a6025e1db40114c/nvim/lua/plugin/vim-illuminate.lua

https://github.com/ryoppippi/dotfiles/blob/1c1a2e4c7759fadff15612e20a6025e1db40114c/nvim/lua/plugin/nvim-navic.lua

また、LspDetach は LSP Server が開いた Buffer から Detach されたときに発火します。
これのうまい使い所は... 今のところ思いついていません。誰か教えて下さい

## 追記 2023/05/02

さて、上では`LspAttach`を使った`on_attach`関数を紹介しました。
ではこれまで LSP Server に直接渡していた`on_attach`はもう不要なのかというとそうではありません。
Server に直接指定する`on_attach`は特定の Server でのみ有効にしたい設定を渡すのには都合が良いです。

たとえば、自分の設定ではこの`on_attach`を使って、特定の Server でのみファイルの Format を無効にする設定を渡しています。

https://github.com/ryoppippi/dotfiles/blob/3b19caa12b6911a738da4f39604f525176f35f48/nvim/lua/plugin/nvim-lspconfig/init.lua#L113-L117

# vim.lsp.start/vim.lsp.buf_attach_client

Neovim 0.8 以降では、`vim.lsp.start`、そして`vim.lsp.buf_attach_client`という関数が追加されました。
この 2 つは

- `vim.lsp.start`: LSP Server を起動する
- `vim.lsp.buf_attach_client`: LSP Server を Buffer に Attach する

実は、現在の nvim-lspconfig は、この２つの関数をラップしたものになっています。
先ほどの例にあった`lspconfig.lua_ls.setup({})`では、これらの関数をうまいこと駆使して、Buffer の種類によって最適なサーバーを選んで起動し、プロセスを管理してくれます。

しかし、中には一部挙動が気に食わない場面も出てくるかもしれません。
そんな時に、`vim.lsp.start`をそのまま呼び出すことで、完璧に LSP を制御できるかもしれません。

以下に lua_ls の設定例を示します。

```lua
vim.api.nvim_create_autocmd('FileType', {
  pattern = 'lua',
  callback = function()
    vim.lsp.start({
      name = 'lua_ls',
      capabilities = vim.lsp.protocol.make_client_capabilities(),
      cmd = {'lua-language-server'},
      root_dir = vim.fs.dirname(vim.fs.find({'.git'}, { upward = true })[1]),
    })
  end,
})
```

このように、`Filetype`の autocmd を用いて、`lua`ファイルが開かれたときに`lua_ls`を起動しています。  
また、例えば`ftplugin/python.lua`というファイルを作成して、そこに設定を書くこともできますね。

メリット・デメリットは以下の通りです。

メリット

- 挙動をコントロールできること

デメリット

- 有効にするファイルの種類から、root 判定のファイルの指定、さらにそもそもの LSP Server の起動コマンドの指定までが必要になること

nvim-lspconfig はこの設定が大変な部分をうまくやってくれているので、基本的には nvim-lspconfig を使うのが良いと思います。
ただ、いくつかの Server のデフォルトでの挙動の一部が自分にとってはしっくりきていない部分があるので(tsserver と denols の共存等)、その部分のみ`vim.lsp.start`を使って書き直そうかなと思っています。
(締め切りまでに間に合わなかったので、後日追記します）

# まとめ

Neovim 0.8 以降で可能な LSP の設定方法を紹介してみました。
参考になれば幸いです。

# 参考文献

- https://vonheikemen.github.io/devlog/tools/manage-neovim-lsp-client-without-plugins/
- https://zignar.net/2022/10/01/new-lsp-features-in-neovim-08/
