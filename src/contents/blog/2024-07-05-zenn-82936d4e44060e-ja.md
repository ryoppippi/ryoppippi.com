---
title: "karabiner-elements で Mac版のChatGPTアプリでReturn と Shift + Return を入れ替える"
date: '2024-07-05'
isPublished: true
lang: 'ja'
---

# TL;DR

みなさんMac版のChatGPTアプリを使っていますか？

ChatGPT は Return キーでメッセージを送信します。
複数行にわたるメッセージを送信する場合、Shift + Return で改行を入力します。
この挙動、逆だといいですよね。

実際 Chrome拡張機能で入れ替える例をよくみますね。

`karabiner-elements` で Return と Shift + Return を入れ替える設定を紹介します。

# ルールの確認

自分は [`karabiner.ts`](https://github.com/evan-liu/karabiner.ts)を使っているので、それを使った実装を紹介します。
`karabiner.ts`については以下の記事を参照してください。

/blog/2024-05-23-zenn-85373aaf0c92e0-ja

やっていることはシンプルです。
https://github.com/ryoppippi/dotfiles/blob/6ab729e9edd8877baacd240e4b09fe0ad5d37950/karabiner/utils.ts#L13-L32
https://github.com/ryoppippi/dotfiles/blob/c24beec0aaedd37a51a9d70d5f72c0c6b8f19448/karabiner/karabiner.ts#L8-L11
https://github.com/ryoppippi/dotfiles/blob/c24beec0aaedd37a51a9d70d5f72c0c6b8f19448/karabiner/karabiner.ts#L77-L96

- ChatGPT の Bundle Identifier を探してくる(ここでは `com.openai.chat`)
- Bundle Identifier が `com.openai.chat` の時にルールを有効にする
- Return + Shift が押された時に Return を送信する
- Return が押された時に Shift + Return を送信する
- ついでに Command + Return で Return を送信する

としています。

これがコンパイルされるとこのようになります。

`karabiner.ts` を使ってない人はこちらをコピペして使ってください。
https://github.com/ryoppippi/dotfiles/blob/d736fa2856f85f6e52aca5ea157745b266c1dbe5/karabiner/karabiner.json#L222-L300

# まとめ

`karabiner.ts`使おう
