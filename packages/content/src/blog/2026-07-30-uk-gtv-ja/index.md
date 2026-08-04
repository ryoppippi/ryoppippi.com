---
title: Got the UK Global Talent Visa (Exceptional Talent) as an OSS developer
date: "2026-07-30"
isPublished: false
lang: ja
---

import GtvChart from './gtv-chart/GtvChart.svelte'

UKのGlobal Talent Visa（Digital Technology / Exceptional Talent）を取った。

申請を通じて分かったのは、このビザで問われるのは自己申告ではないということだった。どれだけすごいかを主張するのではなく、自分の仕事が外部からどう見えているかを、第三者が確認できる証拠として示す。そういう仕組みになっている。

この記事では申請手順ではなく、OSS開発者としてどんな実績を持った状態で申請したのか、何が大事だったのかを振り返る。あわせて、founderでも研究者でもないエンジニアにもこういうルートがある、という紹介のつもりで書いている。

> [!NOTE]
> この記事は申請ガイドではない。書類の組み立て方、証拠の優先順位、推薦状や説明文の中身といった申請上のノウハウには踏み込まない。
> 一方で、公開されている制度上の条件、一般にどのような証拠が求められるのか、申請時点で自分がどんな公開実績を持っていたのかは書く。
> この記事は法的アドバイスではない。

+++ この記事で利用したAIについて

- 申請時点の通過確率は、GPT-5.5とClaude Fable 5に独立して推定させ、乖離が小さかった値を採用した。ただし、モデル間の一致は推定精度を保証するものではない。グラフの作成もFableと行った。
- 珍しさのフェルミ推定はGPT-5.6 Sol（max reasoning）で行い、Claude Fable 5にレビューを依頼した。
- 公開情報の検索と候補事例の洗い出しには、ChatGPT（GPT-5.6 Sol / max reasoning）、Claude（Claude Fable 5）、Grok（Grok 4.5）を併用した。本文の数値や制度上の説明は、可能な限り一次資料に戻って確認し、出典を付した。

+++

# 海外生活とビザ

日本で暮らしていると、ビザについて考えることはほとんどない。海外に住むと、これが逆転する。滞在できるか、働けるか、どんな形態で働けるか、いつまでいられるか。生活の土台は全部ビザが決めていて、その上にキャリアも住居も乗っている。

そしてビザには必ず「何に紐づいているか」がある。雇用主スポンサー型のビザは雇用に、dependant（帯同）ビザはパートナーのビザに紐づく。紐づいている先が揺れると、生活ごと揺れる。転職、レイオフ、家族の事情。本来はキャリアや人生の判断であるはずのものに、ビザの都合が混ざってくるのが海外生活の現実だ。

自分は2022年から、妻のStudent visa、続いてGraduate visaのdependantとしてUKにいる。生活に問題はなかったが、滞在の根拠は自分ではなく妻のビザにあった。この記事で書くGlobal Talent Visaは、その紐づき先を「自分の実績」に付け替えるビザだ。

# Global Talent Visaとは

UKの[Global Talent Visa](https://www.gov.uk/global-talent)は、科学、工学、医学、デジタルテクノロジー、芸術などの分野で、leaderまたはpotential leaderとしてendorseされた人向けのビザだ。

分野ごとに、審査を担当するendorsing bodyが決まっている（[一覧](https://www.gov.uk/government/publications/global-talent-endorsing-bodies)）。

| 分野 | endorsing body |
|---|---|
| Academia or research | science / engineering / humanities / social science / medicineの各endorsing body |
| Digital technology | [Tech Nation](https://technation.io/) |
| Arts and culture | Arts Council England |
| └ 映画・テレビ | PACT |
| └ ファッションデザイン | British Fashion Council |
| └ 建築 | RIBA |
| └ デザイン産業 | Design Business Association |
| [prestigious prize](https://www.gov.uk/government/publications/global-talent-eligible-prize-list)の受賞者 | endorsement不要 |

制度は動いている。たとえば[デザイン産業のルート](https://www.gov.uk/global-talent-arts-culture/design-industry)は2026年7月1日に開いたばかりで、graphic design、brand design、product design（工業デザイン）などに専用の窓口ができた（UX/UIは従来どおり[Tech Nationの管轄](https://www.gov.uk/government/publications/global-talent-endorsing-bodies/technical-or-business-skills-covered-by-tech-nation)）。自分の分野が見当たらなくても、来年もそうとは限らない。

自分が申請したのは[Digital Technology route](https://www.gov.uk/global-talent-digital-technology)で、[Tech Nation](https://technation.io/)からendorsementを受けた。区分はExceptional Promiseではなく、Exceptional Talent。

## Exceptional TalentとExceptional Promise

この2つの区分は、申請の形式だけ見るとよく似ている。[Home Officeのcaseworker guidance](https://www.gov.uk/government/publications/global-talent-appendix-w-workers)によると、どちらの区分でも推薦状3通とCV、そして基準を満たすことを示す証拠を最大10点提出する。後述する選択基準も、TalentとPromiseでほぼ同じ文言だ。取得後にビザとしてできることにも、区分の差はない。

違うのは、審査で問われている内容だ。

| | Exceptional Talent | Exceptional Promise |
|---|---|---|
| [必須基準](https://www.gov.uk/global-talent-digital-technology/eligibility)が求める認識 | 分野の**leading talent** | 分野の**potential talent** |
| 証明すること | すでにリーダーである | 将来リーダーになりうる |
| 想定するキャリア段階 | 5年超 | 5年以下 |
| [証拠の例](https://technation.io/home/global-talent-visa-what-to-consider/) | 受賞、登壇、メディア掲載、OSSへのsignificant engagement | 学業成績、innovativeなプロジェクトへの貢献 |
| ILR（永住）まで | 3年 | 5年 |
| [成功者に占める割合](https://www.gov.uk/government/publications/global-talent-visa-evaluation-wave-2-report/global-talent-visa-evaluation-wave-2-report) | 37% | 63% |

必須基準の一語の差（leading / potential）が、表の残りをすべて決めている。同じstar数、同じ登壇歴でも、どちらの区分に置くかで、「すでにリーダーである」ことの証明として読まれるか、「リーダーになりうる」ことの証明として読まれるかが変わる。

だからPromiseは、Talentに届かなかった人の受け皿ではない。キャリア初期の人を将来性で評価するために最初から用意された枠で、実際、成功者の6割以上はPromiseで通っている。キャリア5年以下なら、Talentの実績が揃うのを待つ必要はない。自分は経験が5年を超えていたから、Talentで通るかどうかしかなかった。それだけの話で、どちらで出すかは実績の強さ以前に、キャリアのどの段階にいるかで決まる。

## ビザとしての自由度

[GOV.UK](https://www.gov.uk/global-talent-digital-technology)に書かれている条件だけでも、かなり自由だ。

- job offerもスポンサー企業も要らない
- employee / self-employed / company directorとして働ける
- 仕事を変えても辞めても、Home Officeに知らせなくていい
- 最長5年まで期間を選べて、延長もできる
- 家族を帯同できる
- 最低給与要件も英語要件もない

## ILRという出口

このビザのもう一つの価値は、ILR（indefinite leave to remain、永住）までの近さだ。[Tech NationのExceptional Talentなら3年、Promiseでも5年](https://www.gov.uk/government/publications/global-talent-appendix-w-workers)でILRを申請できる。

ILRを取ると何が嬉しいのか。ビザの期限と更新から解放されるのが本体だが、金額として一番効くのはimmigration health surcharge（IHS）だと思う。UKのビザは[NHSを使うための料金](https://www.gov.uk/healthcare-immigration-application/how-much-pay)として年£1,035を、ビザの年数分まとめて前払いする。5年のビザなら£5,175、家族がいれば人数分かかる。ILRにIHSはなく、以後この支払いそのものがなくなる。

そしてこの「3年」の価値は、これから相対的に上がる可能性がある。UKは標準ルートのILR資格期間を5年から10年へ延ばす「earned settlement」改革を[協議していて](https://commonslibrary.parliament.uk/research-briefings/cbp-10267/)、まだ施行はされていないものの、その案の中でもGlobal Talentは3年のfast-track側に置かれている。仮に案のとおり施行されれば、Skilled Workerは基本10年、Global Talentは3年。周りのルートが長くなるほど、この差は開く。

Skilled Workerとの差は年数だけではない。Skilled Workerはスポンサー企業にビザが紐づくので、レイオフされるとビザの根拠ごと失い、[Home Officeの運用](https://www.gov.uk/government/publications/immigration-status-and-enforcement-action-caseworker-guidance/cancellation-and-curtailment-of-permission-accessible)では通常、残り60日にビザが短縮される。その間に新しいスポンサーを見つけるか、UKを離れることになる。[テック業界の雇用が数年単位で安定しない](https://layoffs.fyi)以上、ILRまでの5年（改革後は10年）をスポンサー付きのまま走り切ること自体がリスクだ。Global Talentは職に紐づいていないから、職を失ってもビザはそのまま残る。

その先の帰化（市民権）は考えていない。[日本は二重国籍を認めていない](https://www.moj.go.jp/MINJI/minji78.html)ので、UKのパスポートを取ることは日本のパスポートを手放すことを意味する。[世界最強クラスのパスポート](https://www.passportindex.org/byRank.php)を捨てる理由がない。住む権利としては、ILRで完結する。

（制度の条件も金額も変わる。実際に申請するときはGOV.UKを確認してほしい。）

# なぜこのビザを取ろうと思ったのか

冒頭に書いたとおり、UKに来られたのは妻のおかげで、滞在の根拠も妻のビザだった。だから自分にとってGlobal Talent Visaは「UKに来るため」ではなく「UKで自由に働くため」のビザだった。

いまは[Rork](https://rork.com)で働きながらOSSも続けている。ずっと同じ会社にいるとは限らないし、OSSが仕事につながることもあれば、将来的に起業する可能性もある。

自分の実績でUKに滞在できる。キャリアの自由度を守るという意味で、これはかなり大きい。

# 何を満たせばいいのか

いずれの区分でも、経歴や実績について一定の条件を満たし、それを第三者が確認できる証拠として提示する必要がある。何をどう出すかは申請ごとに違うが、自己評価では足りない。外部から確認できる実績が要る。

[要件の構造](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent)はこうなっている。

- **MC**（mandatory criteria・必須基準）: 前述の「leading talentとして認識されていること」
- **OC**（optional criteria・選択基準）: 4つのうち2つを満たす
- **推薦状3通**: 分野の専門家3人に、それぞれ別の組織から書いてもらう
- **証拠は最大10点**: これ以上は出せない。10点でMCとOC2つをすべて証明する

OCは次の4つだ（Promiseも文言はほぼ同じで、求める水準だけが変わる）。

1. **OC1**: product-ledなデジタル技術企業のfounderまたはsenior executiveとして、あるいは新しいdigital分野やコンセプトに取り組む従業員としての、innovationの実績
2. **OC2**: 職務を超えて、分野の前進に貢献した仕事が評価されていること
3. **OC3**: product-ledなデジタル技術企業のfounder、senior executive、board member、または従業員としての、技術的・商業的・起業的な重要な貢献
4. **OC4**: 専門家に発表・endorseされた研究による、学術的な貢献

満たすのは2つでいい。OC1とOC3は従業員でも該当しうるし、OC2は職務の外の話、OC4は研究の話なので、**founderである必要はない**。実際、[Tech Nationのレポート](https://technation.io/global-talent-visa-report-2024/)によると、過去10年にendorseされた人のうちfounderは4人に1人。残りの4人に3人はfounder以外で通っている。

ただし、founderとして通る場合と、founderではない個人として通る場合では、出せる証拠の性質が変わる。

founderやsenior executiveは、資金調達、事業の成長、報道といった、会社に紐づいた実績を自分のリーダーシップの証拠に使える。選択基準の1つ目がまさにそれで、[caseworker guidance](https://www.gov.uk/government/publications/global-talent-appendix-w-workers)も、過去5年に事業や株式を保有していた場合はその証拠の提出を求めている。会社の実績は、外から確認しやすい。

一方、founderではない従業員の場合、会社の売上や調達額を自分の証拠にはできない。自分の名前に紐づいた外部評価を、個人として積み上げるしかない。Tech Nationがtechnical applicantの[目安](https://technation.io/home/global-talent-visa-what-to-consider/)として挙げているのが「reputable platformにopen source codeを公開し、significant engagementを得ていること」で、OSSはこの「個人に紐づく、外から確認できる実績」の代表として、制度に最初から組み込まれている。[Application Guide](https://technation.io/global-talent-visa-guide)には、repo starsやdownload統計、commitサマリーといったmetricsが証拠の例として名指しで書かれている。登壇、メディア、受賞も同じ性質を持つ。

ここで注意したいのは、会社の中で良い仕事をしているだけでは足りない、ということだ。OC2の原文は「proof of recognition for work **beyond the applicant's occupation** that contributes to the advancement of the field」で、職務を超えていることが文言そのものに入っている。必須基準の「他者から認識されている」も同じ方向を向いていて、雇用契約の内側で完結する仕事は、どれだけうまくやっていても分野からの認識にはつながらない。仕事の成果が会社の外に出て、分野の中で名前つきで認識されて、初めて証拠になる。

# どのくらい難しいのか

この審査の厳しさは、数字に出ている。Home Officeが開示した[2020/21年度の審査内訳](https://www.whatdotheyknow.com/request/tier_1_global_talent_application/response/1793960/attach/5/FOI%20Response%2063876%20E%20Thornton%20V0.1.pdf)から承認率を計算すると、こうなる。

| endorsing body | 承認率（2020/21・再審査込み） |
|---|---:|
| UKRI | 98% |
| Arts Council England | 89% |
| Royal Society | 84% |
| British Academy | 82% |
| Royal Academy of Engineering | 71% |
| Tech Nation | **50%** |

半分通るなら普通では、と思うかもしれない。ただ、ここに出してくるのは、推薦状3通と証拠10点を揃え、通るかもしれないと考えて準備をやり切った人たちだ。記念受験の起きにくい母集団の、その半分が落ちる。そして同じ性質の母集団を、学術系のbodyは8〜9割通している。[この傾向はその後も続いていて](https://www.ukri.org/publications/global-mobility-evidence-report/global-mobility-evidence-report-2025/)、アカデミアのルートが実績確認に近い運用だとすれば、Digital Technology routeは選抜になっている。しかも[Tech Nationの公式ガイド](https://technation.io/global-talent-visa-guide)が明言するとおり、基準を満たせば通るチェックリスト方式ではなく、審査パネルが申請全体を裁量で判断する。

その推薦状も、頼めば書いてもらえる類のものではない。[制度上の要件](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent)は、分野の専門家として認められた人物が、申請者の仕事を12か月以上詳しく知っていること。それが3人、それぞれ別の組織に必要で、[公式ガイド](https://technation.io/global-talent-visa-guide)は、身近な同僚・上司・友人からの評価レターを不十分とし、別の目的で書かれた手紙の使い回しも、テンプレート的な内容も認めていない。この条件を満たす3人がいる状態そのものが、分野で認識されていることの証明になっている。

落ちた場合の救済も狭い。[endorsementのreview](https://www.gov.uk/global-talent-digital-technology/if-your-endorsement-application-is-refused)（再審査）は無料で請求できるが、審査されるのは手続きに誤りがなかったかどうかだけで、新しい証拠は出せない。判断そのものに不服があるなら、手数料を払って新規申請をやり直すことになる。

とはいえ、全てを満たす必要はない。MCは1つ、OCは4つのうち2つでよく、証拠は10点まで。全科目で満点を取る試験ではなく、選んだ科目で合格点に届けばいい受験に近い。名前の仰々しさに比べれば、要求されているものの形ははっきりしている。

founderと個人のどちらが楽という話ではない。ただ、founderは会社という実績の器を持っているのに対し、個人は器ごと自分で作る必要がある。しかも[Home Officeの調査](https://www.gov.uk/government/publications/global-talent-visa-evaluation-wave-2-report/global-talent-visa-evaluation-wave-2-report)では、成功者のうちExceptional Talentは37%と少数派だ。founderではないエンジニアが、PromiseではなくTalentで通る。この組み合わせがどのくらい珍しいかは、追記で推定した。

# 申請時点で持っていた実績

公開実績の中心にあったのは、間違いなくccusageだ。

[ccusage](https://github.com/ccusage/ccusage)は、Claude Code / Codex / Gemini CLIなどのAI coding agentの利用量やコストを可視化するOSSで、2025年に大きく伸びた。提出時点で約12.7k stars、現在は約17.6k starsまで来ている。

ただ、持っていたのはccusageだけではない。

- ccusageを中心としたOSS実績
- [typia](https://github.com/samchon/typia)など過去のOSS貢献
- [VimConf](https://vimconf.org/2024/) / [NeovimConf](https://neovimconf.live/) / [Claude Code Meetup Tokyo](https://aiau.connpass.com/event/369265/)などでの登壇
- [TECH WORLD](https://www.youtube.com/@TECHWORLD111) / [Software Design](https://gihyo.jp/magazine/SD/archive/2026/202602)などの外部露出
- [WRTN](https://wrtn.io/) / [StackOne](https://www.stackone.com/) / [Rork](https://rork.com)でのAI agent / developer tooling文脈の実務
- RorkでのFounding Engineerオファー
- 推薦状

どれが審査でどう効いたかは分からない。

ccusageはGitHub上の数字にとどまらず、登壇、メディア出演、技術誌掲載、仕事の機会につながった。プロジェクトの利用規模だけでなく、作者として自分が認識される機会が増えた。キャリア全体で見ても、そこが一番大きな変化だった。

## ccusageのstar数だけでは説明できない

star数は、OSS開発者として分かりやすい外部評価の一つだ。AI coding agentが急速に広がる中で、usage / cost visibilityという課題にccusageが早いタイミングで刺さったのは大きかった。

一方、制度が求めるのは単一の数字ではない。実績が外から確認できて、分野への継続的な貢献として説明できるかどうかだ。

そもそもOSSは、この制度が明示的に想定している実績の一つだ。Tech Nationは[Exceptional Talentの目安](https://technation.io/home/global-talent-visa-what-to-consider/)として「technical backgroundを持つ場合、reputable platformにopen source codeを公開し、significant engagementを得ていること」を挙げている。コードを書いて公開していること自体が、そのまま証拠の形式として認められている。

OSSを証拠にする場合も、重要になるのはこのあたりだと思う。

- 実際に利用されているか
- 他の開発者や企業に影響を与えているか
- 本人の継続的な貢献が確認できるか
- 外部の評価や認知につながっているか

ccusageは間違いなく転機だったが、それ以前から続けていたOSS、登壇、実務、発信の延長線上にあった。

## 時系列で見る

後から振り返ると、申請を現実的な選択肢として考えられるようになったのは、公開実績が増えたタイミングと重なっていた。

先に言っておくと、狙って積み上げたものは一つもない。OSSも、登壇も、メディアも、賞も、やりたいからやっていただけで、申請を決めてから振り返ったら、証拠になるものが揃っていた。

以下のグラフは、その「後から振り返った」視点で、申請時点までの公開実績と各時点での通過確率の推定を時系列に並べたものだ。もちろんTech Nationの内部採点ではなく、提出書類と公開実績を後から見返したうえでの主観的な推定である。

<GtvChart />

このグラフで見てほしいのは、赤い線と青い線が同じ形をしていないところだ。

2025年5月末から7月末にかけて、starはほぼ0から約4.9Kまで、週あたり600近いペースで伸びた。それでも推定は20%から40%、20ポイントほどしか動いていない。一方その後の日本滞在期は、starの伸びが週250程度まで落ちたにもかかわらず、推定は40%から58%へ上がっている。

つまりstarそのものではなく、starが登壇、メディア出演、技術誌掲載、仕事の機会へ変換された分だけ動いている。数字が伸びた瞬間ではなく、その数字が第三者から確認できる形になった瞬間に段ができる。

2024年は雇用の面では不安定な時期だった。一方で、OSSは人生で最も書いた年の一つでもあった。

当時は[就職活動](/blog/2025-07-06-how-to-get-job-in-the-uk-ja)もうまくいかず、Global Talent Visaどころではなかった。ただ、この時期のOSS活動、[typia](https://github.com/samchon/typia)への貢献、[VimConf](https://vimconf.org/2024/) / [NeovimConf](https://neovimconf.live/)での登壇が、後のキャリアの下地になっていた。

2025年にccusageを公開し、それが急速に伸びて状況が変わった。ここで初めて、「自分は何の人なのか」を外部から説明しやすくなった。

その後、日本滞在中に複数のイベントで登壇し、YouTubeや技術メディアにも出た。ccusageというOSSではなく、その作者である自分が呼ばれる機会が増えた。

そして[Rork](https://rork.com)へJoinした。書類を出したのはさらにその後、2026年4月16日だ。

# 振り返り

ccusageはキャリア上の大きな転機だった。ただ、どの証拠が決め手だったかは分からない。

2024年のOSS活動、[typia](https://github.com/samchon/typia)への貢献、[VimConf](https://vimconf.org/2024/) / [NeovimConf](https://neovimconf.live/)、[WRTN](https://wrtn.io/)、[StackOne](https://www.stackone.com/)、日本での登壇、[TECH WORLD](https://www.youtube.com/@TECHWORLD111)出演、[Software Design](https://gihyo.jp/magazine/SD/archive/2026/202602)、[Rork](https://rork.com)での仕事、推薦状。これらが、申請時点までに積み上がっていた公開実績とキャリアだ。

自分は大企業の管理職やスタートアップ創業者ではなく、OSS、developer tooling、AI coding agent周辺の実績を中心としたキャリアで申請した。OSS、海外企業、AI developer tooling、将来の起業。こういう働き方には、かなり相性の良いビザだった。

ただ、相性が良いというのは、条件が緩いという意味ではない。通用したのは、外から数えられるか、第三者が名前を出して確認できる成果だけだった。star数、downloads、登壇の記録、掲載誌、企業の発表。どれだけ頑張ったかを書いても意味がなく、他人が見て確認できる形になっているかどうかだけが問われる。

OSSがこの制度で証拠になるのは、その条件を最初から満たしているからだと思う。リポジトリも、star数も、downloadsも、issueのやりとりも、誰が見ても同じものが見える。自分で用意した資料ではなく、外に置いてあるものを指せる。

逆に言えば、外から見える形になっていない仕事は、この制度では証拠にしようがない。コードを書いていることと、それが第三者から確認できることは別で、後者がなければ出せるものがない。

正直、運も良かった。AI coding agentが急速に広がり、usageやcost visibilityが注目されるタイミングでccusageが伸びた。その流れで外部露出やRorkにもつながった。

ただ、完全な偶然だったとも思っていない。それ以前からOSSを書き、開発者向けツールを作り、発信や登壇も続けていた。タイミングが来たときに、それを拾える場所にいたのだと思う。

20代の最後に、自分のOSSとキャリアがこういう形で評価されたことは、素直に嬉しい。

# 5年前の自分へ

この記事を誰に向けて書いたかといえば、5年前の自分だ。海外で暮らしたい気持ちだけがあって、founderでもなく、big techにいるわけでもなく、自分をすごいエンジニアだと思ったこともない。そういう人に向けて書いた。

まず、OSSで取れる。OSSは、この制度に最初から証拠として組み込まれている。リポジトリ、star数、downloads、issueのやりとりは、翻訳のいらない国境を越えた外部評価として、そのまま出せる。キャリア5年以下ならExceptional Promiseという入り口もあり、成功者の6割以上はそちらで通っている。チャンスは思っているより広い。

ただし、証拠になるのはコードだけではない。審査が見るのは「外から確認できるか」で、登壇も、記事も、メディアも、コードと同じ土俵に乗る。自分はどれもビザのためにやったわけではない。ただ、やりたいことを外から見える場所でやっていたおかげで、数年分の活動がそのまま申請の書類になった。楽しくて続けられることを、見える場所でやる。結果としては、それで足りていた。

そして、英語圏で働ける状態を作っておくのは、それ自体に価値がある。UKは問題の多い国でもあるが、世界中から人が集まる場所で、雇用主でもパートナーでもなく自分の実績を根拠に住めるのは、キャリアの選択肢として単純に強い。

自分の20代は、勝ち続きではなかった。むしろ負けの方が多くて、無職の期間もあった。それでも手だけは動かし続けて、その間に書いたOSSが、最後にまとめてビザになった。Exceptional Talentという名前ほど、例外的な人間の話ではない。

# 謝辞

まず妻に。UKに来られたのは、Student visaを取って渡英した妻のおかげで、その後もGraduate visaへ切り替えながら、dependantである自分の滞在をずっと守ってくれた。このビザは、その積み重ねの上に立っている。

そして[Rork](https://rork.com)に。Global Talent Visaを取ろうと最初に提案し、申請を後押ししてくれたのは会社だった。この提案がなければ、申請はもっと先になっていたと思う。

# 追記

ここからは本題を外れる。

## どのくらい珍しいのか

このケースが制度全体の中でどの程度珍しいのか、公開情報と自分の観測範囲をもとにフェルミ推定してみた。

まず、UKへの移民全体とGlobal Talent Visaの規模感を並べる。数字は2025年に揃えた（集計の前提は補足1参照）。

| 対象 | 年あたりの規模 | 対象期間・出典 |
|---|---:|---|
| UKへの長期移住者全体 | 約81.3万人 | 2025年・[ONS](https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025) |
| Global Talentのビザ発給（全分野・dependant含む） | 6,655件 | 2025年・[Home Office](https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables) |
| うちmain applicant | 3,904人 | 2025年・同上 |
| Tech NationのDigital Technology endorsement | 500人以上 | 2024年までの10年平均・[Tech Nation](https://technation.io/global-talent-visa-report-2024/) |

年間81万人がUKに長期移住する一方で、Global Talentは全分野・dependantを含めても6,655件。本人だけなら3,904人で、[Tech Nation](https://technation.io/global-talent-visa/)が担当する[Digital Technology route](https://www.gov.uk/global-talent-digital-technology)は、さらにその中の一分野になる。

推移も見ておくと、2020年の1,036件から2023年の7,360件まで伸びたあと、2024年6,689件、2025年6,655件と横ばいだ。急に増えていたのは2023年までで、いまは頭打ちになっている。

一方、Tech Nationの年平均500人以上は、いまの実態より低く見えるはずの数字だ。2020年2月までの前身であるTier 1 (Exceptional Talent)には年間の上限があり、[Home Officeのimpact assessment](https://www.legislation.gov.uk/ukia/2020/8/pdfs/ukia_20200008_en.pdf)によると撤廃直前で年2,000人、そのうちTech Nationへの初期割当は200人だった。実際の発給はさらに少なく、同じHome Officeのデータでは2014年に120件、2019年でも1,172件（5つのendorsing body合計）。累計5,000人以上は、明らかに後半の年に偏っている。

Digital Technology routeも、著名なソフトウェアエンジニアだけを対象にした制度ではない。[Tech Nationのレポート](https://technation.io/global-talent-visa-report-2024/)によると、過去10年間にendorseされた人の4人に1人がfounderで、3人に1人がsoftware engineering skillsを持つ。founder / CTOとしての事業実績を軸に評価された人も相当数いるはずだ。

一方、本文で触れたとおりOSSもExceptional Talentの実績として想定されている。実際、海外にはOSSのmaintainer実績を重要な証拠としてExceptional Talentを取得した[公開例](https://blog.beraliv.dev/2025-04-23-how-i-earned-uk-global-talent-visa)もある。

そのうえで、2024年までの10年にendorseされた5,000人以上を出発点に、自分に近い条件を重ねてみる。以下は年あたりではなく、その10年間の延べ人数だ。

| 絞り込み | 推定人数（自分含む） | 計算 |
|---|---:|---|
| Digital Technology routeでendorseされた人 | 5,000人以上 | Tech Nationの公開値（補足2参照） |
| うちsoftware engineering skillsを持つ人 | 1,700人以上 | × 1/3（補足2参照） |
| うちExceptional Talent | 500〜850人程度 | × 30〜50%（補足3参照） |
| うちOSS / developer toolingが主要な実績 | 25〜170人程度 | × 5% / 10% / 20%（補足4参照） |
| うち20代 | 3〜40人程度 | × 10〜25%（補足5参照） |
| うち日本人 | 1人〜数人程度 | × 約0.8%（補足6・7参照） |

表の後半ほど不確実性は大きい。それでも、Digital Technology / Exceptional Talent / software engineering / OSS・developer tooling中心 / 20代 / 日本人を全部重ねれば、かなり小さな集団になる。

日本語・英語で検索した範囲では、この条件でExceptional Talentを取得し、背景を日本語で詳しく公開した事例は見つからなかった。

こうして条件を重ねてみると、Digital Technology routeの中では珍しいタイプだったと思う。

## 補足（出典と前提）

1. **1つ目の表の数字**: 年あたりに揃えているが、数える対象が異なるため、同じ母集団を順に絞ったファネルではない。81.3万人は12か月以上UKへ移動した人の推計。6,655件と3,904人は詳細データセットVis_D02のGlobal Talent発給数を集計したもので、Digital Technology以外の分野も含み、英国内での切替・延長は含まない（2025年以降は暫定値）。500人以上はTech Nationの10年累計5,000人以上を単純に10で割った年平均で、本文のとおり実際は後半の年に偏っている。
2. **5,000人以上 / 3人に1人**: どちらも[Tech Nationの2024年レポート](https://technation.io/global-talent-visa-report-2024/)による「過去10年」の累計。レポートの公開が2024年なので、おおむね2014〜2024年にあたる。2つ目の表もこの10年の延べ人数で、年あたりではない。
3. **Exceptional Talentの30〜50%**: [Home OfficeのWave 2調査](https://www.gov.uk/government/publications/global-talent-visa-evaluation-wave-2-report/global-talent-visa-evaluation-wave-2-report)では、成功者4,025人の回答者の37%がExceptional Talentだった。ただしこれはTech Nation単独の公式内訳ではなく、全endorsing bodyを含む回答者構成であり、software engineering層に限定した比率でもない。そのため37%そのものではなく30〜50%の幅で試算している。
4. **OSS / developer toolingの5%・10%・20%**: 該当割合の統計は存在しない。5%・10%・20%はそれぞれ低位・中位・高位シナリオで、特定の数字を正しいと主張するものではなく、仮定を変えた場合に結果がどの程度動くかを見るためのものである。
5. **20代の10〜25%**: 実測値ではない。同じWave 2調査では18〜24歳が1%、25〜34歳が51%だが、後者には30〜34歳とExceptional Promiseが含まれるため、Exceptional Talentでは低くなると仮定している。
6. **日本人の約0.8%**: [Home Officeの公式データ](https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables)を集計すると、2020〜2025年のGlobal Talent発給のうち、main applicant 17,420件に対して日本国籍は139件で0.80%だった。ただしこれはDigital Technology以外の分野もExceptional Promiseも含む比率であり、英国外からの発給のみで、英国内から切り替えた人は含まれない。今回と同条件のユニーク人数を直接示すものではない。
7. **最終行の「1人〜数人程度」**: 補足6の比率を前行に単純適用すると期待値は1人未満になるが、そこまでの絞り込み条件では自分が少なくとも1人実在する。多くても片手で数えられる程度だと考えている。なお、公式統計から「日本人初」と断定することはできない。日本人によるDigital Technology routeのExceptional Talent取得例自体は確認できる。

# 参考リンク

- [Global Talent visa: Overview - GOV.UK](https://www.gov.uk/global-talent)
- [Work in the UK as a leader in digital technology - GOV.UK](https://www.gov.uk/global-talent-digital-technology)
- [Digital Technology route eligibility - GOV.UK](https://www.gov.uk/global-talent-digital-technology/eligibility)
- [Global Talent Visa - Tech Nation](https://technation.io/global-talent-visa/)
- [Global Talent Visa: What To Consider - Tech Nation](https://technation.io/home/global-talent-visa-what-to-consider/)
- [Tech Nation Global Talent Visa Application Guide](https://technation.io/global-talent-visa-guide)
- [Tech Nation Global Talent Visa Report 2024](https://technation.io/global-talent-visa-report-2024/)
- [Global Talent caseworker guidance - GOV.UK](https://www.gov.uk/government/publications/global-talent-appendix-w-workers)
- [Global Talent endorsing bodies - GOV.UK](https://www.gov.uk/government/publications/global-talent-endorsing-bodies)
- [Changes to UK visa and settlement rules after the 2025 immigration white paper - House of Commons Library](https://commonslibrary.parliament.uk/research-briefings/cbp-10267/)
- [FOI 63876: Global Talent endorsement applications 2020/21 - Home Office](https://www.whatdotheyknow.com/request/tier_1_global_talent_application/response/1793960/attach/5/FOI%20Response%2063876%20E%20Thornton%20V0.1.pdf)
- [Global Mobility Evidence Report 2025 - UKRI](https://www.ukri.org/publications/global-mobility-evidence-report/global-mobility-evidence-report-2025/)
- [Global Passport Power Rank - Passport Index](https://www.passportindex.org/byRank.php)
