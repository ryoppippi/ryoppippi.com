---
title: "俺の denols/tsserver(vtsls) 共存術 for Neovim 2024"
date: '2024-05-10'
isPublished: true
lang: 'ja'
---

> [!NOTE]
> この記事は[Vim 駅伝](https://vim-jp.org/ekiden/)の 5/10 の記事です。

# はじめに

NeovimのLSPでDenoのLSP(denols) と tsserver(vtsls)を共存させる試みはこれまで幾度となく行われてきました。
LSPって何？とか問題意識を詳しく知りたい、という方は以下の記事を参照してください。

https://zenn.dev/kawarimidoll/articles/2b57745045b225
https://zenn.dev/mochi/articles/e6b2735108157c
https://zenn.dev/vim_jp/articles/69d26e3f7b0e35

自分もこれまで上の記事を参考にしながら設定をしていたのですが、いくつか不満点がありました。

- node.jsのmonorepoの一部でdenoを使っている場合、denoのLSPとtsserver(vtsls)を共存させるのが難しい
- これらの設定では、`single_file_support = false`にしてしまっているので、例えば書き捨てのtypescriptファイルを開いた時にLSPが効かない

そこで、自分なりのdenoとtsserver(vtsls)の共存術を紹介します。

# 判定ロジックについて

先行研究としての[kyoh86氏の記事](https://zenn.dev/vim_jp/articles/69d26e3f7b0e35)をベースに以下のようなロジックを組みました。

0. 現在開いているBufferのあるディレクトリから、deno関連のファイル^[ `deno.json` `deno.jsonc` `package.json` など。`package.json`がdenoでサポートされているのもややこしい https://github.com/ryoppippi/dotfiles/blob/1c5bb5dcf827f4ca08120b6618031bd845f0ebde/nvim/lua/plugin/nvim-lspconfig/utils.lua#L104-L109] or node特有のファイル^[`package-lock.json`など https://github.com/ryoppippi/dotfiles/blob/1c5bb5dcf827f4ca08120b6618031bd845f0ebde/nvim/lua/plugin/nvim-lspconfig/utils.lua#L111-L118] or git root^[`.git`ディレクトリ] が見つかるまで階層を上がる。
1. もしその階層にnode特有のファイルが見つからなかった場合 -> denols を起動。tsserverは落とす。
2. もし node特有のファイルがあるが、`.vscode/settings.json` 内で許可されていた場合 -> denols を起動。tsserverは落とす。
3. それ以外の場合 -> denolsの`root_dir`に`nil`を設定しSingle file modeで起動。もしtsserverが起動していた場合は落とす。

としています。

具体的なコードは以下の通り。

https://github.com/ryoppippi/dotfiles/blob/05ae64a18c348dd7989f1e67a98864948489f537/nvim/lua/plugin/nvim-lspconfig/servers/denols.lua#L6-L63

https://github.com/ryoppippi/dotfiles/blob/05ae64a18c348dd7989f1e67a98864948489f537/nvim/lua/plugin/nvim-lspconfig/servers/vtsls.lua#L43-L73

# ロジックの補足について諸々

## 階層を上がってファイルを探す方法

以前はkyoh86氏の[climbdir.nvim](https://github.com/kyoh86/climbdir.nvim)を愛用していましたが、今回の実装ではNeovimのlua関数である`vim.fs.root`を使っています。

<details>
<summary>vim.fs.rootについて</summary>

https://neovim.io/doc/user/lua.html#vim.fs.root()

```markdown
vim.fs.root({source}, {marker}) _vim.fs.root()_
Find the first parent directory containing a specific "marker", relative
to a buffer's directory.

    Example: >lua
        -- Find the root of a Python project, starting from file 'main.py'
        vim.fs.root(vim.fs.joinpath(vim.env.PWD, 'main.py'), {'pyproject.toml', 'setup.py' })

        -- Find the root of a git repository
        vim.fs.root(0, '.git')

        -- Find the parent directory containing any file with a .csproj extension
        vim.fs.root(0, function(name, path)
          return name:match('%.csproj$') ~= nil
        end)

<

    Parameters: ~
      • {source}  (`integer|string`) Buffer number (0 for current buffer) or
                  file path to begin the search from.
      • {marker}  (`string|string[]|fun(name: string, path: string): boolean`)
                  A marker, or list of markers, to search for. If a function,
                  the function is called for each evaluated item and should
                  return true if {name} and {path} are a match.

    Return: ~
        (`string?`) Directory path containing one of the given markers, or nil
        if no directory was found.
```

</details>
これで、指定したファイルが見つかるまで階層を上がることができます。

また、ファイル名を指定してその存在を確認するには `vim.uv.fs_stat` を使うことができます。
`fs_stat`の戻り値が`nil`であればファイルが存在しないことを示します。

## `.vscode/settings.json`の読み込み

denoのvscode向け拡張機能は`.vscode/settings.json`でのworkspace設定をサポートしています。

https://docs.deno.com/runtime/manual/references/vscode_deno/#workspace-folders

ここでは

- `deno.enable` - denolsを許可するかどうか
- `deno.enablePaths` - 許可するディレクトリパスのリスト

を設定することができます。

しかし、これは標準ではNeovimでは対応していません。

そこで、neoconf.nvimを使います。
https://github.com/folke/neoconf.nvim

neoconf.nvimはjson形式でLSPの設定を行い、またそれを読み込むことができます。
また `.vscode/settings.json` もサポートされています。

例えばプロジェクトのルートに `.vscode/settings.json`を置いて以下のように設定し、

```json
{
	"deno.enable": true,
	"deno.enablePaths": ["./apps/deno-project"]
}
```

それを読み込むように設定することができます。

こうすれば明示的にプロジェクトごとにdeno or tsserverの使い分けができるようになります。
また、副次的にvscodeユーザーと共同作業する際にも便利です。

以下に読み取りの実装例を示します。

https://github.com/ryoppippi/dotfiles/blob/05ae64a18c348dd7989f1e67a98864948489f537/nvim/lua/plugin/neoconf.lua#L7-L35
https://github.com/ryoppippi/dotfiles/blob/05ae64a18c348dd7989f1e67a98864948489f537/nvim/lua/plugin/nvim-lspconfig/servers/denols.lua#L27-L30

# おわりに

今後も色々試行錯誤していく予定ですが、この方法でdenoとtsserver(vtsls)を共存させることができるようになりました。
もし何か問題点や改善点があれば、ぜひ教えてください。
