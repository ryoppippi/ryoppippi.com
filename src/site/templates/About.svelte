<script lang='ts'>
	import { author } from '../author.ts';

	const projects = [
		{
			name: 'ccusage',
			href: 'https://ccusage.com/',
			description: 'Claude CodeやCodexなど、Coding Agentのトークン使用量と料金を集計するCLI。',
		},
		{
			name: 'SiteMCP',
			href: 'https://github.com/ryoppippi/sitemcp',
			description: 'Webサイト全体を取得し、MCPサーバーとしてLLMへ渡すツール。',
		},
	] as const;

	const links = [
		{ label: 'GitHub', href: 'https://github.com/ryoppippi' },
		{ label: 'CV', href: 'https://cv.ryoppippi.com' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/ryoppippi/' },
		{ label: 'X', href: 'https://x.com/ryoppippi' },
		{ label: 'Bluesky', href: 'https://bsky.app/profile/ryoppippi.com' },
	] as const;
</script>

<article class='mx-auto max-w-3xl py-8 sm:py-16'>
	<header class='grid items-center gap-8 md:grid-cols-[12rem_minmax(0,1fr)]'>
		<img
			class='mx-auto aspect-square size-40 rounded-full object-contain view-transition-name---profile md:size-48'
			alt="{author.name}'s profile icon"
			fetchpriority='high'
			height='400'
			loading='eager'
			src='/ryoppippi.avif'
			srcset='/ryoppippi-174.avif 174w, /ryoppippi-348.avif 348w, /ryoppippi.avif 400w'
			sizes='(min-width: 48rem) 192px, 160px'
			width='400'
		/>
		<div class='text-center md:text-left'>
			<p class='text-lg font-medium text-text-500 dark:text-text-300'>{author.handle}</p>
			<h1 class='mt-2 font-bold leading-tight'>
				<span class='block text-4xl' lang='ja'>{author.japaneseName}</span>
				<span class='mt-2 block text-2xl text-text-500 dark:text-text-300' lang='en'>{author.name}</span>
			</h1>
			<p class='mt-4 text-lg'>Software Engineer / OSS Developer</p>
		</div>
	</header>

	<div class='mt-12 space-y-6 text-lg leading-8'>
		<p lang='ja'>
			木村亮太朗です。{author.handle}としてOSSを作っています。現在はイギリスでソフトウェアエンジニアとして働きながら、ccusageやSiteMCPなどを開発しています。
		</p>
		<p lang='en'>
			I'm Ryotaro Kimura, a software engineer and open-source developer based in the UK. I build ccusage, SiteMCP, and other developer tools as @ryoppippi.
		</p>
		<p lang='ja'>
			2026年にUK Global Talent Visa（Exceptional Talent）の承認を受けました。<a
				class='underline decoration-accent-100 decoration-2 underline-offset-4'
				href='/blog/2026-07-30-uk-gtv-ja/'
			>申請の記録はこちらです。</a>
		</p>
	</div>

	<section class='mt-14' aria-labelledby='about-projects'>
		<h2 class='text-2xl font-bold' id='about-projects'>Projects</h2>
		<div class='mt-5 grid gap-4 sm:grid-cols-2'>
			{#each projects as project (project.name)}
				<a
					class='rounded-lg border border-base p-5 no-underline transition-base hover:scale-[1.02] hover:bg-[#88888811] hover:shadow-lg'
					href={project.href}
					rel='noopener noreferrer'
					target='_blank'
				>
					<h3 class='text-xl font-bold'>{project.name}</h3>
					<p class='mt-2 leading-7 text-text-500 dark:text-text-300'>{project.description}</p>
				</a>
			{/each}
		</div>
	</section>

	<nav class='mt-12 flex flex-wrap gap-x-5 gap-y-3' aria-label='Profile links'>
		{#each links as link (link.href)}
			<a
				class='font-medium underline decoration-accent-100 decoration-2 underline-offset-4'
				href={link.href}
				rel='me noopener noreferrer'
				target='_blank'
			>{link.label}</a>
		{/each}
	</nav>
</article>
