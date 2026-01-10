---
title: "faster-whisperを使ってYoutubeを高速に文字起こしする方法"
date: '2023-04-20'
isPublished: true
lang: 'ja'
---

<!-- spellchecker:off -->

# はじめに

みなさんは、Whisper を使って文字起こしをしているでしょうか？
Whisper は OpenAI がリリースした text2speech のモデルです。

https://openai.com/research/whisper

このモデルは実装を含めて公開されているので、モデルを軽くしたり、あらゆる環境で動かしたり、といった試みが随所で行われています。

https://github.com/ggerganov/whisper.cpp

https://note.com/sangmin/n/na60c017e72d0

今回は、つい先月にリリースされた、faster-whisper のモデルを使って、実際に文字起こしをしてみましょう。

# faster-whisper とは

https://github.com/guillaumekln/faster-whisper

- OpenAI 公式のモデルを軽量化、独自の最適化により、最大 4 倍の高速化を実現
- 軽いと評判の Whisper.cpp よりも高速に動作（ただしメモリは若干多め）
- Whisper.cpp と違って、GPU による高速化の恩恵が受けられる

とまあかなり良さそうです。試してみましょう。

> [!NOTE]
> 今回紹介する faster-whisper も whisper.cpp も開発元は OpenAI ではありません（混同された記述を見かけたため追記）
> あくまでも OpenAI のモデルをベースに改良、再実装をおこなったものです。

# Colab で実行

といっても、Colab で動かすだけです。Colab の Notebook はこちらに貼っておきます。

https://github.com/guillaumekln/faster-whisper/discussions/91

https://colab.research.google.com/drive/1G2Z6JtZVhvVLjKFyWZgIUXfJAQ8I8iDy?usp=sharing

https://colab.research.google.com/drive/1OWYJZpKENevnLzzw-Zl8WPkeIkZh_RiD?usp=sharing

まあこれだけだと心もとないので、参考までに Python によるコードを貼っておきます。

まず必要なライブラリを入れます。

```sh
pip install -U yt-dlp
pip install -U faster_whisper
```

次に以下のコードを実行。

```python
import subprocess
from faster_whisper import WhisperModel

YOUTUBE_ID = "uXCipjbcQfM" # Youtube ID
AUDIO_FILE_NAME = f"{YOUTUBE_ID}.mp3"

# Download audio from Youtube
def dl_yt(yt_url):
    subprocess.run(f"yt-dlp -x --audio-format mp3 -o {AUDIO_FILE_NAME} {yt_url}", shell=True)

dl_yt(f"https://youtu.be/{YOUTUBE_ID}"

model_size = "large-v2"

# GPU, FP16で実行
model = WhisperModel(model_size, device="cuda", compute_type="float16")
# GPU, INT8で実行
# model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
# CPU, FP16で実行
# model = WhisperModel(model_size, device="cpu", compute_type="int8")

segments, info = model.transcribe(AUDIO_FILE_NAME, beam_size=5)

print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

for segment in segments:
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))

```

これで書き起こしができます。
ちなみに、今回の例では Youtube の動画をダウンロードしてその音声を文字起こししていますが、任意の音声ファイルを指定することもできます。

# まとめ

faster-whisper を用いて、Youtube の動画を文字起こしする方法を紹介しました。
適宜色々書き換えて、議事録作成等に役立てて下さい！

# ちなみに

https://openai.com/blog/introducing-chatgpt-and-whisper-apis

OpenAI は公式で Whisper の Web API を公開しています。
使用方法は

```sh
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F model="whisper-1" \
  -F file="@/path/to/file/openai.mp3"
```

これだけです。
2023/04/20 時点では 料金は 1 分$0.006(実際には秒単位での計算)と格安なので、サクッと使うだけなら今回紹介した方法よりもこちらの方が良いかもしれません。

もし以下の場合は faster-whisper を使うのが良いでしょう。

- 外部に音声データを送信したくない場合
- 25MB 以上の音声データを送信したい場合
- つよつよ GPU を既に持っている場合（現段階では電気代を考慮するとローカル実行の方が安いが、今後の電力値上げ次第で変わるかもしれない）
- 何がなんでも無料で使いたい場合(Colab で動かす分には無料なので)
