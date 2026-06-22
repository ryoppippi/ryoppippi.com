---
title: My JS CLI Stack 2025
date: '2025-08-12'
isPublished: true
lang: en
---

Hello, I'm ryoppippi. Nice to meet you if we haven't met before!

Over the past few years, I've created various CLI tools as OSS projects:

- [ccusage](https://ccusage.com/gh)
- [sitemcp](https://github.com/ryoppippi/sitemcp)
- [curxy](https://github.com/ryoppippi/curxy)
- [pkg-to-jsr](https://github.com/ryoppippi/pkg-to-jsr)
- [agentica](https://github.com/wrtnlabs/agentica/tree/2056405a31846775cdf3a1101ac356137247c2ab/packages/cli)
- [bunpare](https://github.com/ryoppippi/bunpare)

In the JS ecosystem, various libraries constantly appear and disappear. I've tried many different tools myself, and here's my current stack for CLI tool development as of 2025.

# My Principles

When creating CLI tools as OSS, I keep these principles in mind:

- Choose libraries that guarantee type safety
- The smaller the bundle size, the better
- Provide comprehensive documentation
- Take maximum precautions to prevent malicious code injection

# Stack

## Package Manager

I use [bun](https://bun.sh/) for the following reasons:

- **Lightning-fast installation**: It's incredibly fast. You can set up environments blazingly fast both locally and in CI
- **Native TypeScript support**: You can directly execute TypeScript files with `bun run`, improving the development experience
- **Excellent compatibility**: Very high compatibility with Node.js - I haven't encountered any compatibility issues so far
- **Useful extensions**: [bun shell](https://bun.com/docs/runtime/shell) is particularly handy for writing simple scripts or executing shell scripts within `package.json`

While [pnpm](https://pnpm.io/) had the edge for monorepo usage, bun is catching up with the recent implementation of [pnpm style isolated install](https://bun.com/docs/install/isolated). Once this stabilises, bun will become more suitable for monorepos as well.

## Bundler

I currently use [tsdown](https://tsdown.dev/), a bundler for JS/TS based on [rolldown](https://rolldown.rs/), which is written in Rust.

Rolldown is a project that aims to reimplement [rollup](https://rollupjs.org/) in Rust. While still under development, it's promising because it aims to achieve rollup's excellent tree shaking capabilities with Rust's performance.

Here's why I chose tsdown:

- **Blazing fast builds**: Overwhelming speed thanks to being Rust-based
- **Superior tree shaking**: Inheriting rollup's design philosophy, it offers more accurate tree shaking than esbuild or bun build
- **Integration with quality assurance tools**: Excellent integration with tools like [publint](https://publint.dev/) and [unplugin-unused](https://github.com/unplugin/unplugin-unused)
- **Rollup plugin compatibility**: Being able to use unplugin plugins directly is a huge advantage
- **Simple configuration**: Very simple config files, including type generation and source map generation
- **Continuous improvements**: Benefits from rolldown updates, such as bundle size reduction

When comparing bundle size and build times, I've achieved better results than [unbuild](https://github.com/unjs/unbuild), [mkdist](https://github.com/unjs/mkdist), [tsup](https://github.com/egoist/tsup), and [bun build](https://bun.sh/docs/bundler).

> Particularly, esbuild-based tools tend to have [less accurate tree shaking, resulting in larger bundle sizes](https://github.com/evanw/esbuild/issues/1420).

Here's an actual example of bundle size improvement through tsdown and rolldown updates:

<Tweet id="1954911556879388686" />

Before rolldown came along, I was a devoted bun build user and even created plugins for bun, but I switched to tsdown as it proved more convenient.

> It's been incredibly useful at my new job too!
> <Tweet id="1941072675872641440" />

> I used to frequently use `tsup`, but since the author has also switched to `tsdown`, I'll likely be using `tsdown` more often going forward.
> <Tweet id="1913448837441806564" />

## Bundling Strategy

When distributing CLI tools, I bundle all dependencies and keep dependencies at zero. There are clear reasons for this:

- **Faster installation**: Dependency resolution is slow. While `bun` is fast, it's noticeably slower with `npm` or `deno`
- **Efficient code distribution**: Tree-shaking ensures only actually used code is included. Distributing as dependencies would mean downloading unnecessary code
- **Operational stability**: Avoids issues from version mismatches. CLI tool users don't need to worry about dependency versions, so including all packages at a specific point ensures consistent operation

This strategy significantly reduces distribution size:

<Tweet id="1911562801530777634" />

To keep bundle sizes small, I prioritise the following when selecting libraries:

- Small size with minimal dependencies
- Effective tree shaking compatibility
- Provides necessary features without excess

For example, ccusage stays under 1MB even without minification:

[![install size](https://packagephobia.com/badge?p=ccusage@15.9.4)](https://packagephobia.com/result?p=ccusage@15.9.4)

I also contribute to frequently used tools to reduce their bundle sizes:

<Tweet id="1924053628370796715" />
<Tweet id="1911049580936143281" />
<Tweet id="1809345336177254439" />

## CLI Framework

I've tried various JS frameworks:

- [gunshi](https://gunshi.dev)
- [cleye](https://github.com/privatenumber/cleye)
- [cac](https://github.com/cacjs/cac)
- [citty](https://github.com/unjs/citty)
- [commander](https://github.com/tj/commander.js)

Currently, I mainly use {@kazupon}'s gunshi:

- **Type-safe API**: [`parseArgs`](https://nodejs.org/api/util.html#utilparseargsconfig)-like API with type-safe command-line argument parsing
- **Comprehensive features**: Includes negatable, enum, alias, type checking, and more
- **Small bundle size**: Lightweight compared to other frameworks
- **Active development**: Innovative features like plugin systems are being added
- **Future potential**: Shell completion, i18n, and help customisation are in development

I originally used `cleye`, but migrated to `gunshi` as it maintains a similar interface while being lighter and more feature-rich.

+++ Example of using gunshi in curxy

https://github.com/ryoppippi/curxy/blob/7073bf01ce6c5b87f068d36bf3d9bb247af8f998/main.ts#L15C1-L90C4

```typescript
const command = define({
	toKebab: true,
	args: {
		endpoint: {
			type: 'custom',
			alias: 'e', // alias configuration
			default: 'http://localhost:11434',
			description: 'The endpoint to Ollama server.',
			parse: validateURL, // custom validation function can be set
		},
		openaiEndpoint: {
			type: 'custom',
			alias: 'o',
			default: 'https://api.openai.com',
			description: 'The endpoint to OpenAI server.',
			parse: validateURL,
		},
		port: {
			type: 'number',
			alias: 'p',
			default: await getRandomPort(),
			description: 'The port to run the server on. Default is random',
		},
		hostname: {
			type: 'string',
			default: '127.0.0.1',
			description: 'The hostname to run the server on.',
		},
		cloudflared: {
			type: 'boolean',
			alias: 'c',
			default: true,
			negatable: true, // automatically generates `--no-cloudflared` from `--cloudflared` option (https://gunshi.dev/guide/essentials/declarative-configuration#negatable-boolean-options)
			description: 'Use cloudflared to tunnel the server',
		},
	},
	examples: ['curxy'].join('\n'),

	// Type-safe argument type definitions
	async run(ctx) {
		const app = createApp({
			openAIEndpoint: ctx.values.openaiEndpoint,
			ollamaEndpoint: ctx.values.endpoint,
			OPENAI_API_KEY,
		});

		await Promise.all([
			Bun.serve(
				{ port: ctx.values.port, hostname: ctx.values.hostname },
				app.fetch,
			),
			ctx.values.cloudflared
			&& startTunnel({ port: ctx.values.port, hostname: ctx.values.hostname })
				.then(async tunnel => ensure(await tunnel?.getURL(), is.String))
				.then(url =>
					console.log(
						`Server running at: ${bold(terminalLink(url, url))}\n`,
						green(
							`enter ${bold(terminalLink(`${url}/v1`, `${url}/v1`))} into ${
								italic(`Override OpenAl Base URL`)
							} section in cursor settings`,
						),
					)
				),
		]);
	},
});
```

+++

## Logging

I use [consola](https://github.com/unjs/consola) for log output. It's attractive for its ability to easily produce rich logs:

- Rich log levels like success, info, error
- Rich output features like boxes and tables
- Simple user input collection using prompts

While not the smallest in terms of bundle size, I chose it for its balance of features.

For more interactive interfaces, I sometimes use [`@clack/prompts`](https://github.com/bombshell-dev/clack).

## Testing

I use [Vitest](https://vitest.dev/) for testing CLI tools. Vitest offers several advantages for CLI tool development:

- **High performance**: Extremely fast execution thanks to its native ES modules support
- **Safe environment variable mocking**: Provides safe and isolated environment variable mocking, crucial for CLI tools that depend on environment configurations
- **In-source testing**: Allows writing tests directly alongside source code using `if (import.meta.vitest)`, eliminating the need to export functions purely for testing purposes

In-source testing is particularly valuable for CLI tools because it allows testing internal functions without cluttering the public API. You can keep implementation details private while ensuring comprehensive test coverage.

# Distribution

## npm

I upload packages to `npm` for distribution.

I previously had high hopes for {@jsr-io}. JSR had attractive features like publishing TypeScript directly without building and automatic documentation generation. However, for CLI tool distribution, it had these issues:

- The only practical option to run tools on jsr is using [deno](https://deno.com/)
- CLI tool users don't necessarily use deno
- When you can control your own build process and documentation generation, JSR's advantages diminish

Therefore, I returned to npm for its versatility.

## Security

Security concerns are often raised about `npx` execution. To address this, I use [OIDC](https://docs.npmjs.com/trusted-publishers) authentication and CI/CD through GitHub Actions to demonstrate package safety. This allows users to verify that distributed packages are trustworthy.

## Recommending `bunx`

<Tweet id="1954545309339574496"/>

`bunx` is bun's package execution tool, essentially bun's version of `npx`. It provides functionality to temporarily download and execute packages from the npm registry with these characteristics:

For my OSS projects, I recommend using [`bunx`](https://bun.com/docs/cli/bunx#shebangs) when running CLI tools from `npm`. I generally don't recommend global installation like `npm i -g <package>` for my packages.

Here's why:

- **Fast installation**: Uses `bun install`, making it significantly faster than `deno npm:foo` or `npx -y foo`, especially noticeable with tools that have many dependencies
- **Maintained compatibility**: [Executes with node if node is specified in the shebang](https://bun.com/docs/cli/bunx#shebangs), maintaining runtime compatibility while benefiting from faster installation
- **Clean environment**: Creates cache in `/private/tmp`, avoiding user environment pollution
- **Automatic updates**: Cache automatically revalidates every 24 hours, ensuring you always use the latest version (clear advantage over global install)

For packages with appropriate bundle sizes where frequent version pinning isn't necessary, CLI execution via `bunx foo` balances user convenience and reduces maintenance burden. I believe `bunx` execution is optimal, especially for frequently updated CLI tools like `ccusage`.

> Recently, [`ccusage` was added to `homebrew` without my knowledge](https://github.com/Homebrew/homebrew-core/pull/230656), but since it's not my recommended method, I haven't added it to the documentation.

# Documentation

I primarily use Claude Code to enrich READMEs. For larger projects, I sometimes create documentation using [vitepress](https://vitepress.dev/).

Vitepress isn't just a static site generator; it excels in:

- Integration with [`typedoc`](https://typedoc.org/)
- Ability to add features like `llms.txt` generation as plugins
- Beautiful code highlighting using [`shiki`](https://shiki.js.org/)

# Other Tools

- [bumpp](https://github.com/antfu-collective/bumpp): Tool for easy semantic versioning
- [publint](https://publint.dev/): Tool for maintaining package quality
- [clean-pkg-json](https://github.com/privatenumber/clean-pkg-json): Removes unnecessary package.json fields before publishing
- [changelogithub](https://github.com/antfu/changelogithub): Creates beautiful GitHub Releases
- [renovate](https://docs.renovatebot.com/): Automates dependency updates. Highly configurable with auto-merge capabilities
- [eslint](https://eslint.org/): Tool for maintaining code quality. I use [biome](https://biomejs.dev/) with fewer contributors, but with more contributors, rules make reviews easier. Rules are managed with [@ryoppippi/eslint-config](https://github.com/ryoppippi/eslint-config). Looking forward to [oxlint](https://oxc.rs/docs/guide/usage/linter)'s type-aware rule development
- [pkg-pr-new](https://pkg.pr.new/): Automatically publishes packages to npm-compatible registry per commit. Easy to test locally
- [bun-only](https://www.npmjs.com/package/bun-only): Used when creating tools that only work with `bun`

# Conclusion

I've introduced my stack for CLI tool development as of 2025. Looking back, I'm reminded of how much I rely on various libraries and ecosystems to advance my development.

I look forward to new libraries and tools making CLI tool development even more convenient in the future.

# Addendum

If you're interested in the internals of [ccusage](https://ccusage.com/), check out [deepwiki](https://deepwiki.com/ryoppippi/ccusage).
