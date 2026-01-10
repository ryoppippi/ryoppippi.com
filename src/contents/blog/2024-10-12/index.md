---
title: How rich this blog system is!
date: 2024-10-12
isPublished: true
lang: 'en'
---

<script>
import Tweet from '$components/Tweet.svelte';
import { YouTube } from 'sveltekit-embed';
</script>

> This post is a demonstration of how rich this blog system is. Continuously updated.

# Titles

# H1

## H2

### H3

#### H4

##### H5

###### H6

# Texts

Hello World

**Bold**

_Italic_

# GitHub Alert

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

# Image

![](https://ryoppippi.com/ryoppippi.jpg)

## Image with a caption

![ryoppippi](https://ryoppippi.com/ryoppippi.jpg 'my avatar')

# Code

**javascript**

```javascript
console.log('Hello World');
```

**zig**

```zig
const std = @import("std");

pub fn main() void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hello, {}!\n", .{"world"});
}
```

# Tweet

<div>
  <Tweet id="1844335472719561111" />
</div>

# Link Card

[@preview](https://ryoppippi.com/blog/2024-09-29)

# Magic Link

{@ryoppippi} {vim-jp} {Svelte Japan}

# YouTube

[youtube](https://www.youtube.com/watch?v=XezoLvr1dX0)

<YouTube youTubeId="XezoLvr1dX0" />

# BudouX (Japanese Line Break)

> あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。
> またそのなかでいっしょになったたくさんのひとたち、ファゼーロとロザーロ、羊飼のミーロや、顔の赤いこどもたち、地主のテーモ、山猫博士のボーガント・デストゥパーゴなど、いまこの暗い巨きな石の建物のなかで考えていると、みんなむかし風のなつかしい青い幻燈のように思われます。では、わたくしはいつかの小さなみだしをつけながら、しずかにあの年のイーハトーヴォの五月から十月までを書きつけましょう。
