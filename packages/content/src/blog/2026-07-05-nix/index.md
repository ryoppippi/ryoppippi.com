---
title: my honest opinion on nix
date: "2026-07-05"
isPublished: true
lang: en
---

<NotByAI />

I started using {@NixOS|nix} since last December:

<!-- https://x.com/ryoppippi/status/1992736704114135291?s=20 -->
<Tweet id="1992736704114135291" />

and it's been almost seven months since then... time flies!!!

# Why nix?

Since 2022, I've been maintaining my dotfiles seriously, and at that time i was using three package managers:

- aqua
- homebrew
- gh(extension)
- lazygit

i was so frustrated with playing with multiple PMs, and i was looking for some ultimate/unifies solutions.

I **WAS** belong to a Japanese tech community, and all of my friends recommended me to use nix, and even one of my friend i met in London told me like that.
I was so curious about it, but at that time nix lang is too new for me, and i just started to my [big project](https://ccusage.com), so i just kept using aqua and whatever.

at the end of November 2025, [Opus4.5 is introduced](https://www.anthropic.com/news/claude-opus-4-5).
this model was revolutionory because for me this model is the first model that can write nix!
so i let him rewrite my entire config to nix/nix-darwin/home-maneger!!
(and actually i was escaping from the deadline of [ an article on Software Design. ](https://gihyo.jp/magazine/SD/archive/2026/202602) ).

# The Beauty of Nix on Dotfiles

# `flake.nix` has changed my life

# Nix for AI era

I use this [`missing-tools` skills ](https://github.com/ryoppippi/dotfiles/blob/04ac30bcc272106c5bce7811ec3d5e65b87f93c8/agents/skills/missing-tools/SKILL.md):

````md
---
name: missing-tools
description: Resolves missing CLI tools. Use when a command is unavailable, a shell reports command not found, or a tool must be run without installing it globally.
---

# Missing Tools

Use this workflow when a command is unavailable in the current shell.

## Priority Order

1. Try the current project's direnv environment:

   ```sh
   direnv exec . <command>
   ```

2. Use [comma](https://github.com/nix-community/comma) for tools from nixpkgs:

   ```sh
   , <command>
   ```

3. Use `nix run` when a specific nixpkgs package is needed:

   ```sh
   nix run nixpkgs#<package> -- <args>
   ```
````

# What I frustrated

Although I love this unified solution, I frustrated how slow the nix is. For example, [one of my website's ci takes around 30 seconds to download all of dependencies](https://github.com/ryoppippi/ryoppippi.com/actions/runs/28338318872/job/83948303089).
if you use `setup-pnpm` action, it takes like 3 seconds instead.
I really love the idea of the pure functional PM, but even if we use binary cache, it is quite slower than just curling tarballs.
I understand that it is kind a tax for avoiding dependency hell and supply chain attacks, but I hope it gets much much much faster.

Also, evaluating `flake.nix` is as quick as I expected. I use `direnv-nix` in almost all of my projects. Every time I updated some dependencies, it takes around 10 seconds to re-evaluate the environment.
I heard that disk speed for small files on macOS is slower than linux. I need to give it a try!

HMR-SOFT-RELOAD-TEST-SENTINEL
second edit sentinel TWO
third edit sentinel THREE
fourth edit sentinel FOUR
