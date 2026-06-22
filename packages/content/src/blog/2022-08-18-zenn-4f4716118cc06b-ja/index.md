---
title: "Zig の TensorFlow Lite ライブラリでMNISTした"
date: '2022-08-18'
isPublished: true
lang: 'ja'
---

![MNIST x TFLite x Zig](./zig-tflite-mnist.png)

# はじめに

Zigで機械学習やりたいなと考えていたところ、[@mattn](https://twitter.com/mattn_jp)様がまた面白いものを作ってくださったので、早速遊んでみた。

https://zenn.dev/mattn/articles/af64c6a3eefad0

# とりあえずMNIST

というわけでMNISTをやってみることにした。
レポジトリはこちらにある。

https://github.com/ryoppippi/zig-tflite-mnist

READMEに従って、上のレポジトリをCloneし、TensorFlow Liteのインストールを済ませ、kaggleから[Dataset](https://www.kaggle.com/datasets/jidhumohan/mnist-png)を落としてきたらあとはビルドするのみ！

一応今回推論に使用するモデルもCommitしてあるが、自分で学習することももちろんできる。
学習に用いたNotebookはこちら↓

[@preview](https://github.com/ryoppippi/zig-tflite-mnist/blob/main/notebook/MNIST_TFLite.ipynb)

# 画像の読み込みについて

mattn氏の記事でも触れられていた通り、Zigで画像を扱うためのライブラリが本当に少ない。
使えるもののうち、開発が進んでいるものも発展途上だったりする。

https://github.com/zigimg/zigimg

しかし、C言語とZigの相性が抜群なことは皆様ご存知だろう。
今回はヘッダーオンリーで画像の読み込みやリサイズが出来て、かつパブリックドメインで使えるSTBライブラリを使用した。

https://github.com/nothings/stb

Zigから本当に簡単に呼び出せたので、Zig使いで画像の扱いに悩んでいる方は是非とも試してみてほしい。

https://github.com/ryoppippi/zig-tflite-mnist/blob/d13f62a3d807fdc44f2059d76174881edfb2f22a/src/c.zig

https://github.com/ryoppippi/zig-tflite-mnist/blob/d13f62a3d807fdc44f2059d76174881edfb2f22a/src/main.zig#L39-L53

# 終わりに

ZigからTensorflow Liteを呼び出せるライブラリを使って、MNISTをやってみた。
画像を扱う機械学習もある程度ならZigでできることがわかった。
皆さんも楽しんでみてください。
