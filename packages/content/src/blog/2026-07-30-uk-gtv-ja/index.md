---
title: OSS開発者としてUK Global Talent Visa（Exceptional Talent）を取得した
date: "2026-08-09"
isPublished: true
lang: ja
---

import GtvChart from './gtv-chart/GtvChart.svelte'

# TL;DR

このブログは長いので興味のあるところから読んでほしい。

- [UK Global Talent VisaのDigital Technology / Exceptional Talentを取った](#自分の申請)
- [Global Talent Visaとは？](#global-talent-visaとは)
- [申請スケジュール](#申請スケジュール)
- [founderでもmanagerでもなく個人の名前に紐づく実績を中心に通った](#何が良かったのか)
- [好きで続けたOSSや登壇が後から仕事やビザに繋がった](#20代の最後に一発逆転した)
- [Tech Nationの直近の承認率は約14%](#どのくらい難しいのか)
- [OSSを軸に取った公開例は世界でも極めて少ない（況んや日本をや）](#どのくらい珍しいのか)
- [承認率や希少性の推定](#追記)
- [パソコン好きのオタクにも海外で暮らす道はある](#おわりに)

申請手順ではなく、自分が何を出したのかと、そこに至るまでのキャリアを書く。

> [!CAUTION]
> このブログは法的アドバイスではない。制度の情報は2026年8月時点のもので、条件も金額も処理時間も変わる。実際に申請するときは[GOV.UK](https://www.gov.uk/global-talent)で最新の情報を確認してほしい。

+++ AIの利用について

- 構成の整理と文章の推敲にChatGPT、Claude、Grokを使った。公開情報の検索にはExaも使った。最終的な内容と表現は自分で確認した。
- 申請時点の通過見込みはGPT-5.5とClaude Fable 5（7月以降のnerfされたバージョン）に独立して推定させ、近い値を採用した。グラフもFableと作った。
- 珍しさのフェルミ推定はGPT-5.6 Sol（max reasoning）で行い、Claude Fable 5にレビューを依頼した。
- 本文の数値と制度上の説明は一次資料で確認し、出典を付けた。

+++

# 海外生活とビザ

日本で暮らしているとビザについて考えることはほとんどない。UKに住むと滞在できる期間も働き方もビザで決まる。

ビザは何かに紐づいている。雇用主スポンサー型のビザは雇用主に、dependant（帯同）ビザはパートナーのビザに紐づく。転職やレイオフ、家族の事情を考えるときにもビザの期限がついて回る。

自分は2022年から妻のビザのdependantとしてUKにいる。

いま振り返ると渡英時にはほかの選択肢もあった。

- [High Potential Individualビザ](https://www.gov.uk/high-potential-individual-visa): 対象大学の卒業生が使えるビザ[^hpi]
- [Youth Mobility Scheme](https://www.gov.uk/youth-mobility): いわゆるワーホリ[^yms]
- [Global TalentのExceptional Promise](#exceptional-talentとexceptional-promise): キャリア初期の人を将来性で評価する区分
- 妻のdependant: 就労制限がほぼなく、雇用でも自営でも働ける

当時は日本の会社のリモートワークで食べていて、UKで働く予定もなかった。一番簡単で自由度の高いdependant visaを深く考えずに選んだ。

生活に問題はなかったが、UKにいられるのは妻のビザのおかげだった。Global Talentなら、妻や勤務先ではなく自分の実績を基に滞在できる。

# Global Talent Visaとは

UKの[Global Talent Visa](https://www.gov.uk/global-talent)は科学、工学、医学、デジタルテクノロジー、芸術などの分野でleaderまたはpotential leaderとしてendorseされた人向けのビザだ。

申請は2段階に分かれる。

1. **Stage 1: endorsement** — 分野のendorsing bodyに「リーダーとして認識されているか」を審査してもらう。決定の公式目安は5〜8週間[^stage1-weeks]
2. **Stage 2: ビザ申請** — endorsementを得てからHome Officeに申請する。ここで見られるのは通常のビザ要件で、才能の審査はStage 1で終わっている

このブログで「審査」と書くのは、ほぼすべてStage 1の話だ。担当するendorsing bodyは分野ごとに異なる（[一覧](https://www.gov.uk/government/publications/global-talent-endorsing-bodies)）。

+++ 対象分野

| 分野 | endorsing body |
|---|---|
| Academia or research | science / engineering / humanities / social science / medicineの各endorsing body |
| Digital technology | [Tech Nation](https://technation.io/) |
| Arts and culture | Arts Council England |
| └ Film and television | PACT |
| └ Fashion design | British Fashion Council |
| └ Architecture | RIBA |
| └ Design industry | Design Business Association |
| [prestigious prize](https://www.gov.uk/government/publications/global-talent-eligible-prize-list)の受賞者 | endorsement不要 |

制度は変わり続けている。たとえばgraphic design、brand design、product design（工業デザイン）には、[Design industryの専用ルート](https://www.gov.uk/global-talent-arts-culture/design-industry)ができた（2026年7月1日開始）[^design-uxui]。いま自分の分野がなくても、今後追加されるかもしれない。

+++

自分が申請したのは[Digital Technology route](https://www.gov.uk/global-talent-digital-technology)で、[Tech Nation](https://technation.io/)からendorsementを受けた。区分はExceptional Promiseではなく、Exceptional Talentだった。

## Exceptional TalentとExceptional Promise

申請の形式はよく似ている。どちらも推薦状3通とCV、基準を満たす証拠を最大10点提出する。ビザを取った後にできることも変わらない[^talent-promise-format]。ただし、難易度は同じではない。

違いはleadingとpotentialのどちらで評価されるかにある。

| | Exceptional Talent | Exceptional Promise |
|---|---|---|
| 必須基準が求める認識 | 分野の**leading talent** | 分野の**potential talent** |
| 証明すること | すでにリーダーである | 将来リーダーになりうる |
| 想定するキャリア段階 | 5年超が目安 | 5年未満が目安 |
| 証拠の例 | 受賞、登壇、メディア掲載、OSSへのsignificant engagement | 学業成績、innovativeなプロジェクトへの貢献 |
| ILR（永住）まで | 3年 | 5年 |
| 通った人に占める割合[^promise-share] | 37% | 44% |

*割合は全分野の調査回答者ベースで、残り19%は区分不明。*

Talentは「すでにleading talentであること」、Promiseは「将来リーダーになりうること」を証明する。Talentの方が申請時点で求められる実績の水準は明確に高い。Talentで申請してもPromiseとしてendorseされた例がある[^talent-to-promise]。

Promiseはキャリア初期の人を将来性で評価する独立した区分だ。早い段階なら、Talentの実績が揃うのを待たずPromiseで申請できる。詳しい日本語の体験記もある[^promise-writeup]。自分はtechnology分野で5年を超える経験があり、それまでに得ていた外部評価を基にTalentで申請した。

## ここでいう「リーダー」

ここでいうleaderは組織のリーダーとは限らない。部下の人数や役職ではなく、仕事がdigital technology分野に与えた影響や外部からの評価も見られる[^leader-assessment]。

自分もpeople managerではないしfounderでもない。OSSを作っている一人のエンジニアだ。それでもOSS、登壇、メディア、実務、推薦状を通じて分野のleading talentとして認められた。

## ビザとしての自由度

[GOV.UK](https://www.gov.uk/global-talent-digital-technology)の説明だけ見ても、自由度はかなり高い。

- job offerもスポンサー企業も要らない
- employee / self-employed / company directorとして働ける
- 仕事を変えても辞めても、Home Officeに知らせなくていい
- 最長5年まで期間を選べて、延長もできる
- 家族を帯同できる
- 最低給与要件も英語要件もない

同じく実績で評価される枠組みは他国にもある。ただし米国の[O-1](https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement)は雇用主かagentによるpetitionが必要で、本人単独では出せない。自己申請できるEB-1Aは永住権そのもので、審査も期間も別物だ。雇用に紐づかず自分の実績だけで申請して住める点で、このビザはかなり珍しい。

## ILR

このビザはILR（indefinite leave to remain、永住）までの期間も短い。Tech NationのExceptional Talentなら3年、Promiseでも5年で申請できる[^ilr-clock]。

ILRを取ると何が嬉しいのか。ビザの期限と更新から解放されるのが本体だが金銭面で最も大きいのはimmigration health surcharge（IHS）だ。UKのビザはNHSを使うための料金として年£1,035をビザの年数分まとめて前払いする（5年なら£5,175、家族は人数分）[^ihs]。ILRにIHSはなく以後この支払いそのものがなくなる。

日数の管理からも解放される。ILRまでは原則として12か月あたり180日までしかUKの外にいられず、渡航のたびに日数を数えることになる。うちでは妻が几帳面にカウントしてくれていた。ILRの後はこの計算が要らなくなる[^ilr-absence]。

しかも標準ルートのILRは、5年から10年へ延ばす方向で改革が進んでいる（まだ施行前）[^earned-settlement]。5年でも長いのに10年はさすがに長い。その案でも、Global Talentは3年のfast-track側に置かれている。

Skilled Workerとの差は年数だけではない。標準の年収要件は2024年に£26,200から£38,700へ上がり、2025年7月には£41,700になった（2026年現在も同額）[^sw-salary]。

特に若手の仕事探しは厳しい。16〜24歳の失業率は16.2%（2026年第1四半期）。graduate vacancyには平均140件の応募が来る。UKの大学卒業生でfull-timeで働いていたのは56.4%（卒業15か月後）だった[^young-job-market]。仕事を見つけるのが難しい世代ほどビザを出せる仕事の条件まで厳しくなる。

卒業後はGraduate routeで2年間UKに残れる（PhDは3年間）。ただしGlobal Talent / Skilled WorkerのILRにはカウントされない[^graduate-ilr]。切り替えた時点からILRまでのカウントが始まる。

さらにSkilled Workerはスポンサー企業にビザが紐づく。レイオフされると通常60日以内に[^curtailment]次のスポンサーを見つけるかUKを離れることになる。そんな状態でILRまでの5年（改革案どおりなら10年）を走り切るのは怖い。Global Talentは職に紐づいていないから職を失ってもビザはそのまま残る。

その先の帰化（市民権）は考えていない[^naturalisation]。自分にとってはILRがゴールだ。

## 何を満たせばいいのか

要件は区分共通だ。自己評価ではなく、外部から確認できる証拠を出す。

- **MC**（mandatory criteria・必須基準）: Talentなら「leading talent」、Promiseなら「potential talent」として認識されていること
- **OC**（optional criteria・選択基準）: 4つのうち2つを満たす
- **推薦状3通**: その分野の別々の専門家3人に書いてもらう
- **証拠は最大10点**[^evidence-split]: この証拠でMCと選んだOC2つを証明する

OCは次の4つだ[^oc-promise]。

1. **OC1**: product-ledなデジタル技術企業のfounder / senior executiveとして、または新しいdigital分野に取り組む従業員として、innovationを起こした実績
2. **OC2**: 職務外でデジタル技術分野の発展に貢献し、その仕事が評価されていること
3. **OC3**: product-ledなデジタル技術企業のfounder、senior executive、board member、または従業員として、技術・商業・起業面で重要な貢献をしたこと
4. **OC4**: 専門家から評価された研究を通じた学術的な貢献

満たすのは2つでいい。OC1とOC3は従業員でも該当する。OC2は職務外の活動で、OC4は研究なので**founderである必要はない**。過去10年にendorseされた人の4人に3人はfounder以外だ[^founder-share]。

ただしfounderとそうでない従業員では出せる証拠の性質が違う。founderやsenior executiveは資金調達や事業の成長といった会社の実績をリーダーシップの証拠に使える。founderではない従業員は会社全体の売上や調達額だけでは自分の実績にならない。その数字に自分がどう貢献したかを自分の名前に紐づく証拠で示す必要がある。

大手tech企業で働いていても社名や肩書きだけでは自分の実績にならない。大きな会社では仕事がチームの成果になりやすい。NDAもあるので個人の貢献を外から見える証拠にするのは難しい。

コミュニティへの還元が全員の必須要件というわけではない（OC1とOC3を選ぶ申請もできる）。OC2を選ぶ場合は、職務外で分野に貢献し、それが評価された証拠が必要になる。

そこでOSSが効く。個人の名前に紐づき外から確認できるからだ。Tech Nationもopen source codeを証拠の例として明記している[^open-source-evidence]。登壇、メディア、受賞も同じだ。会社の中だけで完結する日常業務はOC2には使いにくい。通常の職務を超えて分野に貢献し、その仕事が外部から評価されている必要がある[^oc2-wording]。

推薦状も誰にでも頼めるわけではない。分野の専門家として認められている必要がある。さらに申請者の仕事を12か月以上詳しく知っている人が3人必要になる。身近な同僚や上司というだけでは足りない[^letters]。

## どのくらい難しいのか

| endorsing body | 分野 | 直近の承認率 | 2020/21年度[^rates-2021] |
|---|---|---:|---:|
| Tech Nation | Digital technology | **約14%**（2025-26）[^tn-rate-recent] | 50% |
| UKRI | 研究全般 | —[^no-perbody] | 98% |
| Royal Society | 自然科学 | — | 84% |
| British Academy | 人文・社会科学 | — | 82% |
| Royal Academy of Engineering | 工学 | — | 71% |
| （学術系4bodyの合算） | | 約87%（2024-25）[^rate-caveat] | 約84% |
| Arts Council England | Arts and culture | 約76%（〜2023・累計）[^ace-rate] | 89% |

*承認率はいずれもTalentとPromiseの合算。区分別の内訳は開示されていない。*

Tech Nationの直近値は約14%で、1年前の約27%からほぼ半減した（954/3,590 → 587/4,087）[^foi-gap]。7人に1人しか通っていない。なお表のほかのbodyとは対象期間が違うので単純比較はできない。

自分が提出したのは、開示された中で最も承認率の低い年度が終わった直後の2026年4月だった。

Tech Nationの公式ガイドにも、基準を満たせば必ず通るチェックリスト方式ではなく、審査パネルが申請全体を判断すると書かれている[^holistic-review]。

落ちた場合の救済手段も限られる。[endorsementのreview](https://www.gov.uk/global-talent-digital-technology/if-your-endorsement-application-is-refused)（再審査）は無料で請求できる。ただし確認されるのは証拠の見落としや処理上の誤りで新しい証拠は出せない。判断そのものに不服があるなら手数料を払って新規申請をやり直すことになる。

難しいビザではある。ただ著名なfounderや大企業の役員だけが対象ではない。OCは4つのうち2つを選べる。従業員としての実績も職務外のOSSも使える。

# なぜ取ったのか

dependantでも自由に働けたので転職のために取ったわけではない。妻のビザの期限を気にせず自分で次を選べるようにしたかった。いまは{Rork}で働きながらOSSも続けているが、ずっと同じ会社にいるとは限らないしこの先何が起こるかも分からない。

出口が近いのも大きい。このビザは3年でILR（永住）に届く。

Rorkに勧められて初めてこのビザを知った。通る自信はなかったが、やってみることにした。

# 自分の申請

## 何を出したのか

実績の中心にあったのは間違いなくccusageだ。

{@ccusage|ccusage}は、Claude Code / Codex / Gemini CLIなどのAI coding agentの利用量やコストを可視化するOSSで、2025年に大きく伸びた。提出時は約12.9k starsだった（2026年現在は約17.8k）。

ほかに出したのは次の実績だ。

- {typia}など過去のOSS貢献
- {NeovimConf} / [Claude Code Meetup Tokyo](https://aiau.connpass.com/event/369265/)などでの登壇
- {TECH WORLD} / [Software Design](https://gihyo.jp/magazine/SD/archive/2026/202602)などの外部露出
- [Thanks OSS Award](https://www.toyokumo.co.jp/2025/10/16/oss-award-2025-lasthalf)の受賞
- {@wrtnlabs|WRTN} / {@StackOneHQ|StackOne} / {Rork}でのAI agent / developer tooling文脈の実務
- {Rork}からのFounding Engineerオファー
- 3人からの推薦状

## 何が良かったのか

Tech Nationからは結果しか返ってこなかった。なぜ通ったのかを自分なりにAIと分析した。

ccusageはコードを公開しただけではなかった。提出時点で約12.9k starsがあった。利用者、issue、PR、派生ツールも増えていた。Tech Nationがopen source codeの目安として挙げるsignificant engagementを数字で出せた[^open-source-evidence]。

OSSの外にも自分の名前が残っていた。登壇ページと動画、メディアの記事、受賞ページ、仕事のオファーもあった。どれもccusageの作者として外から確認できた。OSSの成果を審査する人にも分かる形にできていた。

OSS maintainerでも不承認になった公開例はある[^oss-vs-tn]。Tech Nationが見るのはmaintainerという肩書きだけではない。

## 20代の最後に一発逆転した

20代はだいたい苦労していた。大学に入るまでパソコンは禁止されていてコードを書き始めたのも遅い。最初に勤めたスタートアップの給料は大学院の学費と家賃を払うと何も残らなかった。博士課程にも進んだが博士号は諦めた。UKに来たら日本で積んだ人脈はほぼリセットされた。2024年には無職になった。UKで最初の仕事を得るまでの半年強で533件のポジションに応募した。

その間にやっていたOSSや登壇はビザのためでも一発逆転を狙ったものでもない。おもしろそうだから手を動かした。人前で話すのが好きだから登壇した。ccusageも[Claude Maxプランでどれだけ得しているか見てニヤニヤするために作ったCLI](https://ryoppippi.com/blog/2025-05-29-zenn-6c9a8fe6629cd6-ja)で最初の実装は2時間だった。

当時はどれも別々にやっていた。あとから振り返ると全部つながっていた。仕事もビザも取れた。

グラフに示した通過見込みは、申請時の実績を後から見て自分で推定したもの（Tech Nationの採点ではない）。

<GtvChart />

<div hidden>グラフを取得できない場合は元データを参照: /blog/2026-07-30-uk-gtv-ja/gtv-chart/timeline.json</div>

仕事がない間もOSSは書き続けた。2024年はそれまでの人生で最もOSSのコードを書いた年だった。この時期のOSS活動、{typia}への貢献、{NeovimConf}での登壇が後のキャリアの下地になった。

[@preview](https://ryoppippi.com/blog/2024-12-31)

UKでの就職活動については、以前のブログにまとめている。

[@preview](https://ryoppippi.com/blog/2025-07-06-how-to-get-job-in-the-uk-ja)

2025年にccusageを公開すると急速に伸びて状況が変わった。ここで初めて「自分は何の人なのか」を外部から説明しやすくなった。

2025年5月末から7月末にかけてstarはほぼ0から約4.9Kまで伸びた。日本滞在中はstarの伸びが鈍化したが、ccusageをきっかけにいくつかのイベントに呼んでもらい、YouTubeや技術メディアにも出た。いろんな人とccusageの話ができるのがただ嬉しかった。当時はそれがビザに繋がるとは思っていなかった。振り返ると、その一つひとつがビザに繋がっていた。

[@preview](https://ryoppippi.com/blog/2025-11-06-japan-trip-ja)

その後{Rork}に入社した。申請を始めたのは入社後だった。

UK企業からやっと最初のオファーにありついたのは2025年5月末だった。ccusageが生まれたのも同じ月だ。その1年後、「分野のリーダーとして認識されているか」の審査を通った。

正直PromiseではなくTalentで通ったのはかなり嬉しかった。将来性だけではなくそれまでに積んだキャリアをleading talentとして認めてもらえたからだ。

## 申請スケジュール

| 2026年 | できごと |
|---|---|
| 1月末 | 準備開始 |
| 4/20 | Stage 1: endorsement申請の全書類をHome Officeへ提出 |
| 5/10 | Home Officeが申請をTech Nationへ回付[^stage1-process] |
| 6/5 | Exceptional Talentとしてendorsement承認 |
| 6/7 | Stage 2: ビザ申請 |
| 6/9 | biometrics（指紋・顔写真） |
| 8/9 | ビザ承認 |

Stage 1は提出から承認まで46日だった。公式目安の5〜8週間[^stage1-weeks]の範囲内だが、下限の5週間は超えている[^stage1-slowdown]。Stage 2も申請から承認まで9週間かかり、UK国内からの申請の公式目安である8週間[^stage2-weeks]を超えた。目安を過ぎても連絡がない間は精神的にきつかった。

# おわりに


自分はただコードを書くのが好きな、どこにでもいるごく普通のパソコン大好きオタクだ。とりあえず面白いと思うものを作り続けてたらいくつかがバズり、目立ちたがり屋なのが功を奏してメディアや登壇に呼んでもらえた。
大企業にいたわけでもスタートアップの創業者でもない。でも好きなことをやり続けていたらそれまでの点と点が全部結びついてこのビザに繋がった。

20代を通して将来が見えず毎日もがいていた。最後の最後に自分のOSSとキャリアがこういう形で評価されたことが素直に嬉しい。

これからも自分はモノを作り続けて楽しんでいけたらいいなと思っている。

そして、このブログが、海外に興味がある人、OSS大好きな人、そういう人にとって参考になれば幸いである。


# 謝辞

- 妻: イギリスに連れてきてくれた。結果的に自分のキャリアも大きく広がった。渡英してから4年間、妻のビザのおかげでUKに滞在できた
- 推薦状を書いてくれた3名: それぞれ別の場所で自分の仕事を見てくれていた。3名は互いを知らないが、違う角度から自分のキャリアを評価してくれた
- {@times-yasunori|yasunori project}の皆さん: UKでの就活を始めるきっかけをくれた。ここで切磋琢磨しなければ今の仕事もこのビザもなかった
- {Rork}: このビザを教えてくれた。言われなければ、知らないままだった
- {TECH WORLD}: 声をかけてくれた。動画はコミュニティの外にも届いた
- {@ccusage|ccusage}のcontributorとユーザー: star、issue、PR、派生ツールまで、たくさんの人に使ってもらった。ありがとう

<Divider />

# 追記

ここからは調べた数字もまとめておく。自分が申請したときに近いケースが見つからず、結局かなり調べることになった。次の人が同じ調査をするのも無駄なので全部置いておく。

## どのくらい珍しいのか

OSSを軸にTalentを取った人の統計はない。自分に近いケースがどのくらい珍しいのか、2025年を基準に3つの仮定でフェルミ推定した（前提は後述）。

| 対象 | 年あたりの規模 | 対象期間・出典 |
|---|---:|---|
| UKへの長期移住者全体 | 約81.3万人 | 2025年・[ONS](https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025) |
| Global Talentのビザ発給（全分野・dependant含む） | 6,655件 | 2025年・[Home Office](https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables) |
| うちmain applicant | 3,904件 | 2025年・同上 |
| Tech NationのDigital Technology endorsement | 500人以上 | 2024年までの10年平均・[Tech Nation](https://technation.io/global-talent-visa-report-2024/) |

発給件数を単純に比べても、Global TalentはUKへの長期移住者全体の1%にも満たない。main applicant分は3,904件で、[Digital Technology route](https://www.gov.uk/global-talent-digital-technology)はさらにその一部になる。

年間の発給数は2020年の1,036件から2023年の7,360件まで伸び、そこからは横ばいになっている（2024年6,689件、2025年6,655件）。

+++ 年平均500人の前提

2020年2月までの前身であるTier 1 (Exceptional Talent)には年間の上限があった。[Home Officeのimpact assessment](https://www.legislation.gov.uk/ukia/2020/8/pdfs/ukia_20200008_en.pdf)によると撤廃直前で年2,000人（Tech Nationへの初期割当は200人）。実際の発給はさらに少ない。同じHome Officeのデータでは2014年に120件、2019年でも1,172件（5つのendorsing body合計）。累計5,000人以上は明らかに後半の年に偏っている。

+++

Digital Technology routeは著名なソフトウェアエンジニアだけを対象にした制度ではない。[Tech Nationのレポート](https://technation.io/global-talent-visa-report-2024/)によると過去10年間にendorseされた人の4人に1人がfounderで3人に1人がsoftware engineering skillsを持つ。founder / CTOとしての事業実績を軸に評価された人も相当数いる。

本文で触れたとおりOSSもExceptional Talentの実績として想定されている。海外にはOSSのmaintainer実績を重要な証拠としてExceptional Talentを取得した[公開例](https://blog.beraliv.dev/2025-04-23-how-i-earned-uk-global-talent-visa)もある。

そのうえで、2024年までにendorseされた5,000人以上を出発点に、自分に近い条件を重ねてみる。

| 絞り込み | 推定人数（自分含む） | 計算 |
|---|---:|---|
| Digital Technology routeでendorseされた人 | 5,000人以上 | Tech Nationの公開値（補足2参照） |
| うちsoftware engineering skillsを持つ人 | 1,700人以上 | × 1/3（補足2参照） |
| うちExceptional Talent | 500〜850人程度 | × 30〜50%（補足3参照） |
| うちOSS / developer toolingが主要な実績 | 25〜170人程度 | × 5% / 10% / 20%（補足4参照） |
| うち20代 | 3〜40人程度 | × 10〜25%（補足5参照） |
| うち日本国籍 | 少なくとも1人（自分） | × 約0.8%（補足6・7参照） |

表の後半ほど不確実性は大きい。それでもDigital Technology / Exceptional Talent / software engineering / OSS・developer tooling中心 / 20代 / 日本国籍という条件まで重ねればかなり小さな集団になる。

日本語のGlobal Talent体験記はいくつかある。ただその多くはILRまで「5年」と書いている。5年ならPromiseの可能性はあるが、記事の記述だけでは区分は分からない。founderとしてExceptional Talentを取った日本人の例はメディア記事で確認できる[^jp-founder-talent]。founderではなくOSS中心の実績でTalentを取り、背景を日本語で詳しく公開した事例は見つからなかった。

+++ 推定の前提と出典

1. **1つ目の表の数字**: 年単位にそろえているが、数える対象が異なるため同じ母集団を順に絞ったファネルではない。81.3万人は12か月以上UKへ移動した人の推計。6,655件と3,904件は詳細データセットVis_D02のGlobal Talent発給数を集計したもので、Digital Technology以外の分野も含みUK内での切替・延長は含まない（2025年以降は暫定値）。500人以上はTech Nationの10年累計5,000人以上を単純に10で割った年平均で、本文のとおり実際は後半の年に偏っている。
2. **5,000人以上 / 3人に1人**: どちらも[Tech Nationの2024年レポート](https://technation.io/global-talent-visa-report-2024/)による「過去10年」の累計。レポートの公開が2024年なので、おおむね2014〜2024年にあたる。2つ目の表もこの10年の累計で、年あたりではない。
3. **Exceptional Talentの30〜50%**: [Home OfficeのWave 2調査](https://www.gov.uk/government/publications/global-talent-visa-evaluation-wave-2-report/global-talent-visa-evaluation-wave-2-report)では、取得者の調査回答者4,025人のうちExceptional Talentは37%（Promise 44%、区分不明19%）だった。ただしこれはTech Nation単独の公式内訳ではなく、全endorsing bodyを含む回答者構成であり、software engineering層に限定した比率でもない。そのため37%そのものではなく30〜50%の幅で試算している。
4. **OSS / developer toolingの5%・10%・20%**: 該当割合の統計は存在しない。5%・10%・20%はそれぞれ低位・中位・高位シナリオで、特定の数字を正しいと主張するものではなく、仮定を変えた場合に結果がどの程度動くかを見るためのものである。
5. **20代の10〜25%**: 実測値ではない。同じWave 2調査では18〜24歳が1%、25〜34歳が51%だが、後者には30〜34歳とExceptional Promiseが含まれるため、Exceptional Talentでは低くなると仮定している。
6. **日本人の約0.8%**: [Home Officeの公式データ](https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables)を集計すると、2020〜2025年のGlobal Talent発給のうち、main applicant 17,420件に対して日本国籍は139件で0.80%だった。ただしこれはDigital Technology以外の分野もExceptional Promiseも含む比率であり、UK外からの発給のみで、UK内から切り替えた人は含まれない。今回と同条件のユニーク人数を直接示すものではない。なお[2026年7月開示の国籍別FOI](https://www.whatdotheyknow.com/request/technation_accepted_and_rejected/response/3484702/attach/5/FOI2026%2008464.pdf)（Tech Nation、申請の多い上位国のみ掲載）に日本は登場せず、日本からの申請は、年間で上位20か国には入らない規模だ。
7. **最終行の「少なくとも1人」**: 補足6の比率を前行に単純適用すると期待値は1人未満になるが、そこまでの絞り込み条件でも、少なくとも自分という実例はある。だから下限は1人で、実態も1人〜数人の規模だと見ている。なお、公式統計から「日本人初」と断定することはできない。日本人によるDigital Technology routeのExceptional Talent取得例自体は確認できる。

+++

## UKの移民政策とGlobal Talent

UKの移民政策は全体として厳格化に向かっている。[2025年5月の白書](https://www.gov.uk/government/publications/restoring-control-over-the-immigration-system-white-paper/restoring-control-over-the-immigration-system-accessible)は移民の抑制を掲げILRの標準資格期間を10年へ延ばす方針を打ち出した。本文で触れたearned settlement協議はその一部だ。

ただ同じ白書の中でもGlobal Talentなどのvery high talent routesには逆向きの施策がある。「very high talent routesで来る人を増やす」「top scientific and design talentがGlobal Talentを使いやすくする」と明記され、実際に[£54MのGlobal Talent Fund](https://www.gov.uk/government/news/uk-launches-global-talent-drive-to-attract-world-leading-researchers-and-innovators)、[優先セクター向けのビザ料金払い戻し](https://www.gov.uk/government/news/reeves-tells-davos-britain-is-the-best-place-in-the-world-to-invest)、Design industryルートの新設など、対象を広げる動きが続いている。2026年2月からは[MACによるtalentルートのレビュー](https://www.gov.uk/government/publications/attracting-talent-to-the-uk-mac-self-commissioning-letter)も始まった。

需要も増えている。2025年9月に米国がH-1Bの大幅な費用引き上げを発表して以降問い合わせの急増が報告された[^enquiry-surge]。Tech Nationへの申請は前年比で14%増えた。2026年1月には、Home Officeが「前例のない量の申請を処理している」と返信したという報告も出ている[^stage1-slowdown]。

加えて、ILRの10年化の予告も駆け込みを生んだと見ている（移行措置は未確定だが、2026年4月から施行される可能性があるとの噂もあったため）。米国からの流入とこの駆け込みが重なった時期に申請も混雑した。

2025年の提出方法変更時、UKVIはendorsementの基準は変えないと告知した[^criteria-same]。その後も入口の宣伝と窓口の拡大が進む一方で申請は増え、承認率は下がった。入口は広がっているように見えるが、実際には通りにくくなっている。

## なぜUKに残るのか

UKには問題が多い。移民への風当たりは年々強くなっているし、経済も好調とは言えない。物価は高く、テックの給与はUSには遠く及ばない。

それでもテックで働く場所としては良い。英語圏なので仕事は世界の市場と地続きだ。投資も人もロンドンに集まってくる。自分はAIならサンフランシスコに次ぐ中心地だと見ている。DeepMindもここにいる。OSSも登壇も日本語圏の外にそのまま届く。日本で働いていた頃より明らかに多くのチャンスが流れてくる。

時差も効く。ロンドンはヨーロッパと米国のちょうど間にいて、午前はヨーロッパ、夕方は米国東海岸、夜には西海岸とも重なる。OSSでも仕事でも、両側との会話がほぼ同じ日のうちに一周する。

[^hpi]: 2022年5月開始。対象は卒業年ごとの[Global Universities List](https://www.gov.uk/government/publications/high-potential-individual-visa-global-universities-list)に載る大学を卒業して5年以内の人。2025年11月に対象校がtop 50相当からtop 100相当へ広がり、リストは約80校に倍増した。期間は2年（PhDは3年）で延長不可、ILRには直接つながらない。
[^yms]: 期間は2年。ILRには直接つながらないが、期限が近づいたら[UK国内でGlobal Talentへ切り替えて](https://www.gov.uk/global-talent/switch-to-this-visa)、そのまま滞在を続けることもできる。最初からGlobal Talentで渡英する必要はない。自分も妻のdependantからGlobal Talentへ切り替えた。全分野を含むHome Officeの取得者調査でも、回答者の30%はUK国内からの申請だった。
[^stage1-weeks]: [GOV.UK](https://www.gov.uk/global-talent-digital-technology)による目安。
[^design-uxui]: UX/UIは対象外で、従来どおり[Tech Nationの管轄](https://www.gov.uk/government/publications/global-talent-endorsing-bodies/technical-or-business-skills-covered-by-tech-nation)。
[^talent-promise-format]: [Home Officeのcaseworker guidance](https://www.gov.uk/government/publications/global-talent-appendix-w-workers)と[Tech Nationの申請ガイド](https://technation.io/global-talent-visa-guide)による。必須基準と証拠例も同資料を参照した。
[^promise-share]: [Home OfficeのWave 2調査](https://www.gov.uk/government/publications/global-talent-visa-evaluation-wave-2-report/global-talent-visa-evaluation-wave-2-report)より。取得者の調査回答者4,025人の内訳はTalent 37%、Promise 44%、残り19%は区分不明・その他。全endorsing bodyの合算で、Tech Nation単独の内訳は公表されていない。
[^talent-to-promise]: Talentで申請し、Promiseとしてendorseされた[申請者の報告](https://discourse.tnvisaforum.org/t/applied-for-exceptional-talent-but-got-endorsed-as-exceptional-promise-can-i-appeal/17598)がある。
[^promise-writeup]: [Global Talent Visa（Exceptional Promise）取得記](https://note.com/921kiyo/n/n1f8bf10b9f79)。エンジニアによる、申請プロセス全体の日本語の解説。
[^leader-assessment]: [GOV.UKの審査項目](https://www.gov.uk/global-talent-digital-technology/eligibility)には、career history、仕事のinternational reputationとimpact、推薦状と証拠の強さ、過去の仕事のcommercial impactなどが挙げられている。管理職であることは要件に含まれない。
[^ilr-clock]: [Home Officeのcaseworker guidance](https://www.gov.uk/government/publications/global-talent-appendix-w-workers)による。この資格期間に数えられるのは、Global Talentと一部の就労ルートでの滞在だけ。自分は2022年からUKに住んでいるが、Studentビザ系のdependantだった期間はカウントされず、3年はここからやり直しになる。
[^ihs]: [GOV.UKのIHS料金表](https://www.gov.uk/healthcare-immigration-application/how-much-pay)による。
[^ilr-absence]: [continuous residenceの規定](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-continuous-residence)による。ただしILRも、[連続で2年を超えてUKを離れると失効する](https://www.gov.uk/returning-resident-visa)。それでも、年単位の日数管理とは別次元の話だ。
[^earned-settlement]: [「earned settlement」改革](https://commonslibrary.parliament.uk/research-briefings/cbp-10267/)。[意見募集は2026年2月に終了](https://www.gov.uk/government/consultations/earned-settlement)しており、まだ施行はされていない。
[^sw-salary]: [Home Officeのimpact assessment](https://www.gov.uk/government/publications/changes-to-immigration-rules-impact-assessments/2024-spring-immigration-rules-impact-assessment-accessible)と、2026年7月1日更新の[Immigration Rules](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker)による。一般的な申請者に適用される標準額で、職種別のgoing rateの方が高ければそちらが必要になる。PhD、new entrantなどの例外もある。
[^young-job-market]: 16〜24歳の失業率は[ONSの時系列](https://www.ons.gov.uk/employmentandlabourmarket/peoplenotinwork/unemployment/timeseries/mgwy/lms)、応募数は[Institute of Student Employersの2025年調査](https://ise.org.uk/knowledge/insights/552/the_application_explosion_key_insights_for_employers/)による。卒業後の進路は、HESAのGraduate Outcomesを基にした[What do graduates do? 2025/26](https://luminate.prospects.ac.uk/what-do-graduates-do)から。2022/23年度に卒業し、15か月後の調査に回答したUK-domiciledのfirst-degree卒業生179,675人が対象。
[^graduate-ilr]: [Immigration RulesのGlobal Talentに関するqualifying period](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent)と[Skilled Workerに関するqualifying period](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker)のどちらにも、Graduate routeは対象として含まれていない。10-year long residenceは別の制度。
[^curtailment]: [Home Officeのcancellation and curtailment guidance](https://www.gov.uk/government/publications/immigration-status-and-enforcement-action-caseworker-guidance/cancellation-and-curtailment-of-permission-accessible)による運用。
[^naturalisation]: 日本国籍の自分が自らUKの市民権を取得すると、[国籍法第11条](https://www.moj.go.jp/MINJI/minji06.html)により日本国籍を失う。[世界最強クラスのパスポート](https://www.passportindex.org/byRank.php)を手放してまで、UKのパスポートが欲しいわけではない。
[^evidence-split]: [Tech Nationの申請ガイド](https://technation.io/global-talent-visa-guide)による。内訳にも決まりがある。MCに最低2点、選んだOC2つに最低4点（1基準あたり2点）。同じ証拠を複数の基準には使い回せない。
[^oc-promise]: [Immigration Rules](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent)とTech Nationの申請ガイドによる。Promiseではキャリア初期であることも見られる。OC1はfounderまたは従業員、OC3もfounderまたは従業員が対象で、Talentにあるsenior executiveやboard memberの文言はない。
[^founder-share]: [Tech Nationの2024年レポート](https://technation.io/global-talent-visa-report-2024/)による。
[^open-source-evidence]: Tech Nationはtechnical applicantの[目安](https://technation.io/home/global-talent-visa-what-to-consider/)として、reputable platformでopen source codeを公開しsignificant engagementを得ていることを挙げている。[Application Guide](https://technation.io/global-talent-visa-guide)にもrepo stars、download統計、commitサマリーがmetricsの例として書かれている。
[^oc2-wording]: [Immigration Rules](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent)の原文は「work beyond the applicant's occupation」。雇用契約や報酬の有無を境界にはしていない。
[^letters]: [Immigration Rules](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent)と[Tech Nationの公式ガイド](https://technation.io/global-talent-visa-guide)による。公式ガイドは、別の目的で書かれた手紙の使い回しも、テンプレート的な内容も認めていない。なおImmigration Rulesの文言は「3人の別々の専門家」で、caseworker guidanceでは「別々の組織」と表現されている。自分は別々の組織の3人に頼んだ。
[^rates-2021]: [Home OfficeのFOI開示](https://www.whatdotheyknow.com/request/tier_1_global_talent_application/response/1793960/attach/5/FOI%20Response%2063876%20E%20Thornton%20V0.1.pdf)（2020/21年度）から、承認÷（承認+不承認）・再審査込みで計算。
[^tn-rate-recent]: [Home OfficeのFOI開示](https://www.whatdotheyknow.com/request/technation_accepted_and_rejected/response/3484702/attach/5/FOI2026%2008464.pdf)（FOI2026/08464、2026年7月16日）。再審査で覆った分を含むかは明記されていない。
[^no-perbody]: body別の承認率は2020/21年度を最後に公開されていない。学術系は4body合算のindicative figureがあるだけで、業界レポートも[内訳データの欠如を指摘している](https://www.abpi.org.uk/media/5y5nhiui/ey-abpi-attracting-global-talent-a-pro-growth-plan-for-uk-life-sciences.pdf)。
[^rate-caveat]: [UKRI Global Mobility Evidence Report 2025](https://www.ukri.org/publications/global-mobility-evidence-report/global-mobility-evidence-report-2025/)より。Royal Society / Royal Academy of Engineering / British Academy / UKRIの合算で、UKRI自身が正式統計ではないindicative figureだと断っている。2021〜2023年度は9割前後で推移していた。
[^ace-rate]: [Arts Council Englandがメディアに提供した累計データ](https://www.artsprofessional.co.uk/news/exclusive-ace-endorses-2600-visas-outstanding-talent)より。2011年からの累計で、年による振れが大きい（2020年は89%）。
[^foi-gap]: 本文の分数はEndorsed÷Totalで計算した。2025-26年度は開示表のEndorsed 587とNot Endorsed 3,497の合計が4,084で、Totalの4,087と3件ずれている（保留・取下げ分とみられる）。
[^holistic-review]: [Tech Nationの公式ガイド](https://technation.io/global-talent-visa-guide)による。
[^oss-vs-tn]: OSSの実績で申請して不採択になり、[審査への批判を公開しているmaintainer](https://art-deco.github.io/open-source/)もいる。コードを書いて公開していることと、それが分野への価値として審査側に見えることは、別の問題だ。
[^stage1-process]: 2025年8月4日からTech Nationの独自ポータルが廃止され、申請はHome Officeに提出してからTech Nationへ回付される方式になった（[Tech Nationの公式FAQ](https://technation.io/visa_faq/)）。変更前には数日でendorsementされた公開例もあるが、個別の速い例であって通常処理の平均ではない。[3営業日の例](https://discourse.tnvisaforum.org/t/endorsed-for-talent-in-3-working-days/8350)もある。自分の申請でも4/20の提出から5/10のTech Nationへの回付まで20日かかった。
[^stage1-slowdown]: 2026年1月には、Home OfficeのGlobal Talent窓口が「前例のない量の申請を処理している」と遅延を詫びる自動返信を出していた。gov.uk上に公式な告知はなく、[申請者フォーラムへの転載](https://web.archive.org/web/20260804184309/https://discourse.tnvisaforum.org/t/current-stage-1-waiting-time-2026/25207)が唯一の公開情報。
[^stage2-weeks]: [GOV.UK](https://www.gov.uk/global-talent)による。UK外からの申請は3週間、UK内からの申請は8週間が目安。
[^jp-founder-talent]: インタビュー記事や登壇者紹介での言及がいくつか確認できる。ただし、いずれもendorsing bodyの明示や、本人による詳細な体験記はない。
[^enquiry-surge]: [Irwin Mitchellの報告](https://www.irwinmitchell.com/news-and-insights/newsandmedia/2025/september/surge-in-global-talent-visas-as-uk-as-firms-respond-to-us-visa-clampdown)（2025年9月29日）。発表直後から問い合わせが目に見えて増えたとしている。
[^criteria-same]: [2025年8月の提出方法変更に際してのUKVIの文言](https://eiglaw.com/uk-updates-global-talent-visa-endorsement-process-with-tech-nation-from-august-4-2025/)で、「The criteria for endorsement will remain the same」。需要急増を受けた2026年の新しい声明は、探した範囲では見つからなかった。
