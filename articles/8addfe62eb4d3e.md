---
title: "🌶️ IMHO 🌶️ - Rich Harris on frameworks, the web, and the edge."
emoji: "🌶️"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["翻訳", "javascript", "svelte", "sveltekit", "フロントエンド"]
published: false
---

:::message
この記事はSvelte/Sveltekitの作者である[Rich Harris](https://twitter.com/Rich_Harris)氏による講演「🌶️ IMHO 🌶️」を翻訳したものです。  
翻訳を許可していただいたRich氏に感謝を表明したいと思います。  
また、適宜訳注を入れています。

記事の作成にあたり、Whisperによる書き起こし、DeepLおよびChatGPTによる翻訳を使用しています。
:::

https://youtu.be/uXCipjbcQfM

# はじめに [Introduction]

![IMHO](/images/imho_rich/0_0.png)
:::details 原文
So, I'm going to be giving a talk tonight called In My Humble Opinion, and it's a collection of loosely connected thoughts about recent trends in front-end development.
There's a lot of really interesting and innovative stuff happening in the front-end world at the moment, and this is a good time as any to take stock of it.
So, I'm going to be sharing some opinions of varying levels of spiciness, and I'm going to talk about how those opinions shape the design of Svelte and SvelteKit.
I'm not here to try and convince you of anything.
You'll probably find lots to disagree with me about, but hopefully this will give you some insight into how we think about our role as toolmakers.
Now, it takes a certain lack of humility to stand in front of a room of people and talk for half an hour as if my words mean something, but having said that, I am very aware that some of the ideas I'll be talking about tonight have come from the brains of far smarter and more accomplished people than me, so take everything that I say with a grain of salt. These are humble opinions.
And finally, while I think that the Svelte team would broadly agree with the things I'm going to say tonight, I'm not claiming to speak for them.
I'm also not speaking for Vercel, which is a healthfully pluralistic company, even if we all dress the same.
These are my humble opinions.
:::

今夜は「In My Humble Opinion（私の謙虚な意見）」というタイトルで、フロントエンド開発の最近のトレンドについて、ゆるやかにつながった考えをまとめたものです。
現在、フロントエンド界隈で非常に興味深く、革新的なことがたくさん起こっているため、それを把握するのにいい機会だと思います。
そこで、私はいくつかのスパイシー度合いの異なる意見を共有し、それらの意見がSvelteとSvelteKitの設計にどのように影響しているかについて話します。

私はあなたを説得するためにここにいるのではありません。
しかし、私たちがツールメーカーとしての役割をどのように考えているのか、この講演がそのヒントになれば幸いです。

さて、大勢の人の前に立って30分も自分の言葉に意味があるかのように話すのはある種の謙虚さの欠如を感じます。
そうは言っても、今夜お話しするアイデアのいくつかは、私よりはるかに賢くより優れた人々の頭脳から生まれたものだということは重々承知していますので、私の言うことはすべて大目に見てください。
これらは**謙虚な意見**です。

最後に、Svelteのチームは、私が今夜話すことに大筋で同意してくれると思いますが、私は彼らの代弁者ではありません。
また、Vercelの代弁者でもありません。Vercelは健全な多元的企業であり、たとえ私たち全員が同じ服を着ていたとしてもです。
これらは、**私の謙虚な意見**です。

# フレームワークは問題ない（🌶）[Your framework is fine (🌶)]

![IMHO](/images/imho_rich/1_0.png)

:::details 原文
I'm going to start with a fairly non-spicy opinion.
There's too much thought leadership that would have you believe that JavaScript frameworks are the root of all that is wrong with the web, and if only people would make better technology choices, the web would be perfect.
The only problem with it is it is absolute horseshit. When you last went on a recipe website and had to fight through a gauntlet of ads and newsletters and cookie consent banners and the recipe author's story about her childhood memories of Aunt Beryl's butter pecan cookies, and you left thinking, if only they had used a different abstraction for creating DOM elements.
No, you don't.
:::

まず、比較的スパイシー度の小さい意見から始めます。
JavaScriptフレームワークがウェブの諸悪の根源であり、人々がより良い技術選択をすればウェブは完璧になると信じることをソートリーダーシップ^[[ソートリーダーシップ](https://adv.asahi.com/marketing/keyword/11053380)]が多すぎるように思います。
ただ、それは完全に出鱈目です。最後にレシピサイトを訪れ、広告やニュースレターやクッキーの同意バナーやレシピ作者の幼少期の思い出に関する話に苦戦した時に、別のDOM要素の抽象化を使用していれば良かったのにと思ったことがありますか？
いいえ、そんなことはありません。

# なぜ Web はクソなのか [Why web sucks]


:::details 原文
The web doesn't suck because of JavaScript frameworks.
It sucks because of capitalism.
It sucks because of the attention economy, because we pay for everything with data, and because we're all slaves to the algorithm.
On some level, we all know this, and so I've come to believe that, as framework authors, the most impactful thing we can do isn't fixating on a kilobyte here or a millisecond there.
It's empowering developers through education and documentation and diagnostics and sensible defaults to do the right thing in the face of structural forces that bend the web towards sucking it.
The other stuff matters, but probably less than we think, because every now and then, someone will show some data that proves some frameworks deliver better experiences than others.
This is a chart that shows how the main JavaScript-centric application frameworks score on Core Web Vitals measurements.
You can see that only Astro and SvelteKit outperform the average website, but we have to be careful how we interpret this.
For example, Astro explicitly markets itself as being designed for content sites that don't require much interactivity, and so it has a natural advantage over frameworks that are typically used for more demanding workloads.
All of which is to say that, as much as we love to talk about technology choices, for the most part, you shouldn't feel pressured by me or anybody else to switch away from whatever makes you productive shipping software.
:::

![IMHO](/images/imho_rich/2_0.png)

ウェブが駄目なのはJavaScriptフレームワークのせいではありません。
それは資本主義のせいです。
アテンション・エコノミーのせいで、データですべての代金を支払うから、そして、私たちは皆、アルゴリズムの奴隷だから最悪なのです。
私たちは皆、あるレベルでこれを知っていると思います。

したがって、フレームワークの作者として私たちができるもっとも効果的なことは、キロバイトやミリ秒にこだわることではありません。
教育やドキュメンテーション、診断、合理的なデフォルトを通じて、構造的な力に立ち向かって正しいことをするために開発者を強化することです。

他のことも重要ですが、考えているほど重要ではないかもしれません。なぜなら、時折、データに基づいて、一部のフレームワークが他のものよりも優れた体験を提供することが証明されることがあるからです。

![IMHO](/images/imho_rich/2_1.png)

これは、主要なJavaScript中心のアプリケーションフレームワークが、Core Web Vitalsの測定でどのようなスコアを獲得したかを示すグラフです。
AstroとSvelteKitだけが平均的なウェブサイトを上回っていることがわかりますが、これをどう解釈するかは注意しなければなりません。
たとえば、Astroは、インタラクティブ性をあまり必要としないコンテンツサイト向けに設計されていることを明確にアピールしており、より負荷の高いワークロードに通常使用されるフレームワークよりも自然に優位に立つことができます。

つまり、私たちは技術の選択について話すのが大好きですが、ほとんどの場合、私や他の誰からもソフトウェアを出荷する際に生産性を高めるものから切り替えるようにプレッシャーを感じる必要はない、ということなのです。

## 0kbのJavaScriptは目標ではない (🌶🌶) [0kb JS is not a goal (🌶🌶)]
:::details 原文
 Next take something I've seen more and more of lately is people talking about zero kilobytes of JavaScript, as in, this framework ships zero kilobytes of JavaScript by default.
 The implication is that JavaScript is inherently bad, and so a framework that doesn't serve JavaScript is inherently good, but zero kilobytes of JavaScript is not a goal.
 The goal is to meet some user need, or if you're cynical, to meet some business need by way of meeting some user need, and sometimes performance is a factor in how effectively you can meet that need.
 We've all seen the studies showing that for every millisecond delay, Amazon loses a billion dollars or whatever, and sometimes you can improve startup performance by having less JavaScript, but doing so is always in the service of some other objective.
 Collectively, we are in danger of mistaking the means for the end, and as we'll see later, if you want the best possible performance, JavaScript is actually essential.
 This is something that I see with things like Lighthouse.
 Lighthouse is an example of Goodhart's law.
 When a measure becomes a target, it ceases to be a good measure.
 We're incentivized to chase the green 100 at any cost.
 That's not how Lighthouse was originally supposed to be used.
 Lighthouse is a diagnostic tool to help us identify and fix issues.
 It is not a scorecard.
 So this is learn.svelte.dev, our interactive platform for learning Svelte and SvelteKit.
 It gets a pretty lousy performance score, because in order to work, it needs to download and install Node inside your browser along with SvelteKit and Vite, and then it needs to start a development server.
 It is doing a lot of work, and it does it pretty quickly, but not quickly enough for Lighthouse.
 You could get a better score by only doing that work when you start interacting with the site, but that would be a pretty serious regression in user experience.
 I see this pattern over and over again across all different kinds of sites.
 A single number simply cannot capture that nuance, and you should be wary of people who use those numbers to try and convince you of something.
:::

![IMHO](/images/imho_rich/3_0.png)

 最近よく見かけるようになったのは、「このフレームワークはデフォルトで0キロバイトのJavaScriptを出荷しています」という話です。
 JavaScriptは本質的に悪いものなので、JavaScriptを使わないフレームワークは本質的に良いものだという意味合いですが、**JavaScriptを0キロバイトにすることは目標ではありません**。
 目標はユーザーのニーズを満たすことです。あるいは、皮肉的に言えば、ビジネスニーズを満たすことによってユーザーニーズを満たすことです。
 時にはパフォーマンスが、そのニーズをいかに効果的に満たすことができるかの要因になることもあります。

 私たちは皆、1ミリ秒の遅延ごとにアマゾンが10億ドルの損失を被るという研究結果を見たことがあります。
 JavaScriptを少なくすることでスタートアップのパフォーマンスを改善できる場合もありますが、そうすることは常に他の目的のためです。

 まとめてみると、我々は手段と目的を取り違えている危険性があります。後述するように、最高のパフォーマンスを求めるなら、実はJavaScriptは必要不可欠なのです。

![IMHO](/images/imho_rich/3_1.png)

 これは、Lighthouseなどで見られるものです。
 Lighthouseは、Goodhartの法則の例です^[[Goodhartの法則](https://en.wikipedia.org/wiki/Goodhart's_law)]。ある指標が目的になると、それは良い指標ではなくなります。
 何が何でも緑の100点を追い求めるというインセンティブが働くのです。
 Lighthouseの本来の使い方はそうではありません。 

 **Lighthouseは、問題を特定し、修正するための診断ツールです。**
 **スコアカードではありません。**

![IMHO](/images/imho_rich/3_2.png)

 これは、SvelteとSvelteKitを学ぶための私たちのインタラクティブプラットフォームである[learn.svelte.dev](learn.svelte.dev)です。
 このLighthouseのスコアはとても低いですが、これはSvelteとSvelteKitを含むNodeをダウンロードしてブラウザー内にインストールし、開発サーバーを起動する必要があるためです。
 多くの作業を行っており、かなり速く行っているのですが、Lighthouseの基準では十分な速さではありません。
 
 もしこれらの作業をユーザーがサイトとやり取りするときに行うようにすれば、スコアは改善されるでしょう。しかし、それはユーザ体験を著しく低下させることになります。
 私はこれをあらゆる種類のサイトで何度も見ています。
 単一の数字ではその微妙なニュアンスを捉えきれないため、それらの数字を使って何かを説得しようとする人には警戒すべきです。

# ほとんどのサイトはJavaScriptなしでも動作するべきである (🌶🌶) [Most sites should work without JavaScript (🌶🌶)]

:::details 原文
 Most sites should work without JavaScript.
 This might seem like it directly contradicts the previous take, but it doesn't.
 These two things are both true.
 Number one, JavaScript is necessary to deliver the best possible user experience.
 Number two, sometimes you can't rely on JavaScript.
 A website I reference constantly is this one.
 Everyone has JavaScript, right?
 For those of us who live in New York, you're very familiar with the experience of loading
 a page while at a subway station, but losing connectivity before JavaScript loads.
 It really sucks.
 I believe that most web apps should be mostly functional without JavaScript.
 Say Google Calendar, for example.
 Obviously JavaScript is useful here, but is it essential?
 Can I really not see my appointments and create new ones without JavaScript?
 The likely answer is, well, we could, but increased development cost isn't worth it.
 And I'm not blaming the developers for this or for the product managers for having the wrong priorities, but I do think it's a shame that the tooling used to build apps like this one don't make it easy enough to build progressively enhanced apps.
 Ideally, you should get an app that works without JavaScript for free, and that is something
 that we on the SvelteKit team strive for.
 For example, we server render everything by default, and we spend a lot of time thinking about how to make it as easy or easier to use forms, which work without JavaScript, than it is to use fetch.
 Another reason that this is close to my heart is that in my patch career as a journalist, I've seen how fragile the web can be as an archival medium when it ends on JavaScript.

 This is Kim Kardashian's Instagram page at various points over the last decade.
 Early on, the site was basically just text and images, and we can look at a snapshot today and it's perfectly preserved.
 By 2019, you can no longer see the actual images.
 They're still there on her account, I checked, but because they're rendered with JavaScript, they're not part of the archive. Finally, by 2020, the growth factors got involved, and you can no longer see anything on Instagram without logging in.
 And maybe you don't care what Kim Kardashian was wearing in 2017, but so much of modern culture is mediated through ephemeral digital platforms that there is a real possibility that future historians will have an easier time answering the question, what was it like to live through the space race, than answering the question, what was it like to live through the AI revolution?
 I think that's a tragedy.
 2016 is an interesting case because the content is actually there when you first load the page, but when the JS loads, it looks at the URL bar, says, hey, this isn't Kim Kardashian's profile, and just nukes the entire page.
 And we can go back to 2016 and fix that.
 Frankly, if we could go back to 2016, we might have some other priorities.
 But what we can do is ensure that our tools today are flexible enough to continue working when unexpected things happen.
 So this is something that SvelteKit actually does out-of-the-box.
 The client-side router will gracefully figure out the base URL when it starts up.

 To demonstrate this, I've deployed a version of our docs to the interplanetary file system, which is a peer-to-peer network for sharing files.
 Click on this link.
 So you can see that the URL there has this IPFS slash very long string in front of it.
 The catch with IPFS is you don't know that string until you've generated the site because it's based on the content.
 So you have this chicken and egg problem.
 And yet, it still works.
 The client-side routing still works.
 Really difficult to use a mouse when you're facing backwards at a screen.
 The client-side routing works, he said, without having checked it.
 The search function maybe works.
 Okay.
 So things are working, even though I'm on shared Wi-Fi, and it's a little bit flaky, obviously.

 But the point is that SvelteKit is designed to be resilient enough to work even in these fairly hostile environments.
:::

![IMHO](/images/imho_rich/4_0.png)

ほとんどのサイトはJavaScriptなしでも動作するべきです。
これは前述の見解と直接矛盾するように見えますが、実際には矛盾していません。
これらの2つのことは両方とも真実です。

**1つ目は、最高のユーザー体験を提供するためには、JavaScriptが必要だということです。**
**2つ目は、JavaScriptに頼れないこともある、ということです。**

[私が頻繁に参照するウェブサイトの1つ](https://www.kryogenix.org/code/browser/everyonehasjs.html)は、この点を説明するのに適しています。

ニューヨーク在住の人々にとって、地下鉄の駅でページを読み込んでいるときに、JavaScriptが読み込まれる前に接続が切れてしまう経験に非常に馴染みがあると思います。それは本当につらいことです。

![IMHO](/images/imho_rich/4_1.png)
私は、ほとんどのWebアプリはJavaScriptなしでもほとんど機能するべきだと考えています。
たとえば、Googleカレンダーを見てみましょう。
JavaScriptは明らかにここで役立ちますが、それが必要なものでしょうか？
JavaScriptなしで自分の予定を見たり、新しい予定を作成したりできないのでしょうか？
答えは、「できるけど、開発費がかさんで割に合わない」でしょう。
私は、このことについて開発者やプロダクトマネージャーを非難するつもりはありませんが、このようなアプリを構築するためのツールがProgressive Enhancementなアプリを簡単に作れないことをとても残念に思います。

理想的には、JavaScriptなしでも動作するアプリを無料で提供する必要があります。これは、SvelteKitチームが目指すものの1つです。
たとえば、私たちはすべてのものをサーバーサイドでレンダリングし、フォームを使用する際にJavaScriptなしで使用することができるようにする方法について多くの時間を費やして考えています^[[Form actions • Docs • SvelteKit](https://kit.svelte.jp/docs/form-actions)]。

![IMHO](/images/imho_rich/4_2.png)
もう1つの理由として、私の過去のジャーナリストとしてのキャリアの中で、JavaScriptが止まってしまうと、ウェブがアーカイブメディアとしていかにもろくなるかを目の当たりにしてきたからです。
これは、過去10年間のKim KardashianのInstagramページです。
初期は基本的にテキストと画像だけで、今日スナップショットを見ても完璧に保存されています。
2019年になると、もはや実際の画像は見ることができません。
確認しましたが、彼女のアカウントではまだ残っています。ですが、コンテンツはJavaScriptでレンダリングされているため、アーカイブの一部にはなっていないのです。
最後に、2020年には成長要因が関与し、Instagramにログインしない限り何も見ることができません。
あなたが2017年にKim Kardashianが何を着ていたか気にしないかもしれません。
しかし、現代文化の多くは短命なデジタルプラットフォームを通じて媒介されているため、将来の歴史家は、「宇宙開発競争を生き抜くとはどういうことか」という質問に答える方が、「AI革命を生き抜くとはどういうことか」という質問に答えるより簡単になってしまう可能性があるのです。
私はそれが悲劇だと思います。 
2016年は興味深いケースです。最初にページを読み込むと実際にコンテンツがあるのですが、JSがロードされると「これはKim Kardashianのプロファイルではない」と表示されページ全体が削除されます。
2016年に戻って修正できるかもしれません。
正直言って、2016年に戻ることができたら、他にも優先事項があるかもしれません。
ですが、私たちができることは、今日のツールを柔軟に、かつ予期しないことが起こった場合でも継続的に機能させるようにすることです。

SvelteKitは箱から出してすぐにこれができます。
クライアントサイドのルーターは、起動時にベースとなるURLをとびきり上手に扱うことができます。
また、SvelteKitはかなり過酷なネットワーク環境下でも動作するように設計されていることがポイントです。

(訳注: [ここでデモを行う](https://youtu.be/uXCipjbcQfM?t=490))

# MPAは死んだ [MPAs are dead (🌶🌶🌶)]
::: details 原文
 Okay, getting a little spicier.
 This is the first opinion that's probably going to make people yell at me when the recording of this goes on on YouTube in a couple of weeks.
 MPAs are dead.
 So for those of you who aren't captives of web dev Twitter, let me offer some definitions.
 A multi-page app, or MPA, is what people used to call a website.
 It's an app where every page is rendered by the server, and if you navigate between pages, the browser will go back to the server, retrieve some fresh HTML, unload the current document, and then create a new document from the new HTML.
 In contrast, a single-page app, or SPA, doesn't unload the document when you navigate.
 Instead, a client-side router will fetch any code and data it needs for the new page, and it will update the document in place, just like any non-navigation staging.
 Now, advocates of the multi-page app approach have made the following claims.
 MPAs are faster because you don't need to load JavaScript.
 MPAs are more accessible.
 MPAs are less buggy.
 And MPAs can work without JavaScript.
 And in return, the single-page app cam says that SPAs are faster, because even though you do need to load JavaScript, you're probably going to have to load some JavaScript anyway, and this way, you only have to load your analytics or whatever once, instead of every single page load.
 And subsequent navigations are certainly going to be faster, because it's much easier to smartly preload data, and you're not recreating the document from scratch on every navigation.
 SPAs allow you to preserve state between navigations, such as the scroll position of a sidebar, or the video that's currently playing.
 In an SPA, navigation is just like any other state change, so you can do things like continuous transitions.
 There's a view transitions API coming to the platform that helps with this, and it's a wonderful addition, but it only covers stuff that you can do with CSS.
 You can, for example, tween a numeric value in a progress indicator like this, if you were building a survey app.
 And SPAs give you a unified development model.
 Instead of having one language for your HTML and another for your DOM, SPAs are much more cohesive.
 Now, looking at these two lists, you might say, well, the stuff on the right is nice, but the stuff on the left is non-negotiable, and you'd be right, but the reality is that that list is very out of date.
 Modern frameworks like Next and Remix and Sveltekit don't suffer from the problems that afflicted early SPAs, and as we've seen, the claim that MPAs are faster than modern SPAs is highly suspect.
 I've tried to argue in the past that the distinction is actually rather unhelpful, since modern frameworks use techniques from both sides, and I've taken to calling them transitional apps, because we do not need any more moronic acronyms, but this isn't why I'm saying that MPAs are dead.
 I'm saying that MPAs are dead because Astro killed them.
 My Astro friends will be mad at me for saying this, but here's the proof.
 As of last week, Astro's roadmap includes a client-side router that would turn your Astro app into a single-page app.
 In the words of Nate Moore, UI persistence has surfaced as a clear missing piece in the full Astro story.
 Client-side routing is currently the only way to achieve UI persistence across navigation.
 I'll be quick to point out that this is opt-in, it's not the default, but here's what's going to happen.
 They're going to build this thing, and they're going to knock it out of the park, and if it's a simple configuration change, then people will try it, even if they don't need UI persistence, and they'll discover that for the very small price of a client-side router, their app suddenly have a nicer user experience.
 I would not be surprised if the default was reversed in Astro 3 or 4.
 So on the SvelteKit side, we use client-side routing by default.
 Unlike some frameworks, we don't use a link component.
 We just use regular A tags and intercept clicks on them.
 If you want to disable client-side routing for some reason, you can do it on an individual link by adding a data SvelteKit reload attribute, or you can do it for a whole group of links or even the entire document.
 Now one thing that people have rightly criticized SPAs for is that they encourage longer sessions, meaning it's more likely that a new version of the app will be deployed while you're using the old one, which can cause client-side routing to fail because all of the files have moved around.
 So in SvelteKit, if we detect that case, we will fall back to a full page navigation, which usually fixes it, but we also make it easy to proactively detect new deployments and disable client-side routing when that happens.
:::

![IMHO](/images/imho_rich/5_0.png)

さて、ちょっとスパイシー度合いを上げていきましょう。
これは、数週間後にYouTubeでこの録画が公開されたときに、おそらくみんなに怒鳴られることになる最初の意見です。
**MPAは死んだ**。

![IMHO](/images/imho_rich/5_1.png)
というわけで、Web開発者のTwitterアカウントを追ってない人々のために、ここでいくつか定義を説明しましょう。

マルチページアプリケーション（MPA）は、かつてウェブサイトと呼ばれていたものです。
すべてのページがサーバーによってレンダリングされるアプリで、ページ間を移動する場合は、ブラウザがサーバーに戻り、新しいHTMLを取得し、現在のドキュメントをアンロードし、新しいHTMLから新しいドキュメントを作成します。

対照的に、シングルページアプリ（SPA）では、ページの遷移時にはドキュメントをアンロードしません。
代わりに、クライアントサイドのルーターが新しいページに必要なコードとデータを取得し現在のドキュメントをその場で更新します。

マルチページアプリケーションの支持者は、以下の主張をしています。
- MPAはJavaScriptを読み込む必要がないため、より高速である
- MPAはバグが少ない
- MPAはアクセシビリティが高い
- MPAはJavaScriptなしでも動作する

 対して、SPA側はこちらの方が速いと主張しています。
 JavaScriptをロードする必要があるとはいえ、どうせJavaScriptをロードしなければならないのでしょうし、この方法ならページの遷移のたびにJavaScriptをロードする代わりに、1度だけ解析を行えば良いからです。
 そして、その後のページ遷移は確かにより速くなります。
 データをスマートにプリロードすることがより簡単で、すべてのページ遷移でドキュメントをゼロから作成する必要がなくなるからです。
 SPAでは、サイドバーのスクロール位置や再生中の動画など、ナビゲーションの間の状態を保持できます。

 ![IMHO](/images/imho_rich/5_2.png))
 SPAでは、ナビゲーションは他の状態変更と同じように扱われるため、連続的なトランジションのようなことができます。 
 先日View Transitions APIが追加され、CSSでこのような繊維を行えるようになりm下。
 たとえば、サーベイのアプリを作る場合、このような進捗インジケーターでTween Animationを使って数値を動かすことができます。

 また、SPAは統一された開発モデルを提供します。
 HTMLとDOMにそれぞれ別の言語を使うのではなく、SPAはより一貫性のある開発モデルです。

 さて、この2つのリストを見てあなたは「右のものもいいけど、左のものは譲れない」と思うかもしれません。
 その通りなのですが、現実にはこのリストはとても時代遅れなのです。

 ![IMHO](/images/imho_rich/5_3.png)
 NextやRemix、Sveltekitといった最新のフレームワークには、初期のSPAを苦しめた問題はありませんし、これまで見てきたように、MPAが最新のSPAよりも速いという主張は非常に疑わしいです。

 過去に私は、現代のフレームワークが両方の側面の技術を使用しているため、区別は実際にはあまり役に立たないと主張してきました。私はそれらを「移行期のアプリケーション」と呼ぶようになりました。
 しかし、MPAが死んだのはこれらが原因ではありません。
 **MPAはAstroに殺されたのです**

 ![IMHO](/images/imho_rich/5_4.png)
 こんなことを言うとAstroの友人たちに怒られそうですが、これがその証拠です。
 先週の時点で、Astroのロードマップには、Astroアプリをシングルページアプリにするクライアントサイドルータが含まれています。
 Nate Mooreの言葉を借りれば、UIの永続性が完全なAstroのストーリーに欠けていることが明らかになっています。
 現在、クライアントサイドルーティングは、ナビゲーション間のUIの永続性を実現する唯一の方法です。
 これはオプトインであり、デフォルトではないこと私は付け加えておきます。

 しかし、これから起こることはこうでしょう。
 彼らはこれを完璧に構築、実現するでしょう。
 もしそれが簡単な構成変更である場合、UIの永続性が必要なくても、人々はそれを試してみるでしょう。
 そして、クライアントサイドルーターというとても小さな代償が自分のアプリに突然より良いユーザー体験をもたらすことに気づくはずです
 私はAstro 3または4でこの設定のデフォルトが逆転しても驚かないでしょう。

 ![IMHO](/images/imho_rich/5_5.png)
 SvelteKit側では、デフォルトでクライアントサイド・ルーティングを使用することにしました。
 ここでは、いくつかのフレームワークとは異なり、リンクコンポーネントを使用しません。
 通常のaタグを使用し、それがクリックされたときに適切にこれを処理します。
 もし何らかの理由でクライアントサイド・ルーティングを無効にしたい場合は、SvelteKitのリロード属性を追加することで個々のリンクに対して行うことができますし、リンクのグループ全体やドキュメント全体に対して行うことも可能です。

![IMHO](/images/imho_rich/5_6.png)
 SPAはセッションが長くなるため、古いアプリを使用している間に新しいバージョンのアプリがデプロイされる可能性が高く、すべてのファイルの場所が変わってしまってクライアントサイドのルーティングが失敗する可能性がある、と批判されることがあります。
 SvelteKitでは、このようなケースを検出すると、通常はフルページナビゲーションにフォールバックして解決しますが、新しいデプロイメントをプロアクティブに検出してクライアントサイドルーティングを無効にすることも容易にしています。

::: details 訳注
Astroは、登場時にはZero JSを掲げていましたが、その文言は現在は削除されています。
また、AstroのCEOであるFred K. Schott氏はこれに反対しているようです。
https://twitter.com/FredKSchott/status/1648963240779558915?s=20
:::

# 明示的なDSLは良いものです（🌶🌶）[Explicit DSLs are good (🌶🌶)]
::: details 原文
 Alright, next opinion is that explicit DSLs, domain-specific languages, are good.
 DSLs get a bad rap.
 I lie to them.
 DSLs are in contrast to general-purpose programming languages like JavaScript.
 HTML is a DSL, CSS is a DSL, JSON is a DSL, SQL is a DSL, regular expressions are a DSL.
 We don't tend to think of those as such because they're already so pervasive and people are fine with the DSLs that they already know, but you can do some pretty cool stuff with DSLs.
 This is LuCy by Matthew Phillips, and it's one of my favorite examples from recent memory.
 It's a DSL for describing state machines, and you can clearly see how much more expressive the DSL version is than the general-purpose one.
 This is cool, and I want to see more stuff like this.
:::

![IMHO](/images/imho_rich/6_0.png)

次の意見は、明示的なDSL、つまりドメイン固有言語は良いというものです。
DSLの風評被害はすごいです。
私はそれらの意見を嘘つきだと思っています。
DSLはJavaScriptのような汎用プログラミング言語と対照的です。
HTML、CSS、JSON、SQL、正規表現、これらはすべてDSLです。
私たちはこれらをすでに広く使っているため、それらをDSLと考える傾向はありませんが、DSLを使ってかなりクールなことができます。

![IMHO](/images/imho_rich/6_0.png)
たとえばMatthew Phillips氏が開発している[LuCy](https://lucylang.org/)は私の最近のお気に入りの例の1つです。
これはステートマシンを記述するためのDSLであり、汎用言語よりもDSL版の方がどれだけ表現力が高いかがよくわかると思います。
私はこのようなクールなものをもっと見たいと思っています。

# JavaScriptはイベント駆動、UIは状態駆動 [JavaScript is event-driven; UI is state-driven]

::: details 原文
 You see, fundamentally, JavaScript is an event-driven language, which means that we predominantly write code in terms of things that are changing in response to things like user action.
 But when we build user interfaces, we're thinking primarily in terms of state.
 This is the imperative-declarative split, or whatever you want to call it.
 So there's an impedance mismatch at the very foundation between the language that we're forced to use and the task for which we're using it.
 Things like JSX and hooks and signals and all of the other innovations of the front-end world over the last decade or so are all in some way an attempt to resolve that contradiction by letting you write code that is state-first.
 HTML, on the other hand, is a really good language for describing UI.
 There's no temporal aspect to it.
 It's almost like a physical substance like clay, or at least that's how I think of it.
 The catch, of course, is that HTML is static, so you can't use it to describe things with rich interactivity.
 But what if we started with HTML and used that as a springboard to create a new DSL?
 Well, that's basically what Svelte is.
 We've augmented HTML with state and control flow, we've augmented CSS with scope styles, and we've augmented JavaScript with reactivity.
 Some people are really put off by this, and that's totally fine.
 For people who aren't anti-DSL, we've found that this hits a sweet spot between familiarity and novelty.
 We're using languages that you already know, but we're extending them in useful ways, and like with the Lucy example, we're able to express UI much more concisely this way.
:::

![IMHO](/images/imho_rich/7_0.png)

JavaScriptはイベント駆動型の言語なので、ユーザーのアクションに反応して変化するコードを書くのが基本です。
対して、ユーザーインターフェイスを作るときには、主に状態という観点から考えます。
これが、命令型と宣言型の分離、などと呼んだりします。
つまり、私たちが使わざるを得ない言語と、それを使用するはずのタスクのと間には、根本的な思考回路の不一致があるのです。

JSX、フック、シグナル、そして過去10年間におけるフロントエンドの世界のすべてのその他の革新は、すべて、状態を最優先にしたコードを書くことができるようにするための試みであり、この矛盾を解決しようとする試みです。

一方、HTMLはUIを記述するために非常に優れた言語です。
時間的な側面がなく、 粘土のような物理的な物質に近いというか、少なくとも私はそう考えています。
もちろん、HTMLは静的なものなので、リッチでインタラクティブ性を持つものを表現するのには使えません。
**ではHTMLを出発点にして新しいDSLを作るとしたらどうでしょう？**
それがSvelteです。

![IMHO](/images/imho_rich/7_1.png)
私たちはSvelteで、HTMLは状態と制御フローを備えたものに、CSSはスコープスタイルなものに、JavaScriptをリアクティブなものに拡張しています。
一部の人々はこれに対して本当に反感を抱いているかもしれませんが、それはそれでいいんです。
DSLに抵抗がない人たちにとっては、Svelteは親しみやすさと新しさの間のスイートスポットであることがわかりました。
我々がよく知っている言語を便利に拡張することで、Lucyが成し遂げたように、SvelteではUIをより簡潔に表現することができるのです。



