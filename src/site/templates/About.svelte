<script lang='ts'>
	import { SITE_ORIGIN } from '../consts.ts';
	import { SITE_OWNER } from '../site-owner.ts';

	const links = [
		['GitHub profile', '/github'],
		['Recent pull requests', '/pr'],
		['LinkedIn profile', '/linkedin'],
		['Twitter profile', '/twitter'],
		['Bluesky profile', '/bsky'],
		['YouTube channel', '/youtube'],
	] as const;
</script>

<article class='mx-auto mt-8 max-w-3xl px-2 pb-16'>
	<header class='mb-12 text-center opacity-60'>
		<h1 class='text-4xl font-bold' style='view-transition-name:title-about'>About</h1>
		<div class='mt-6 font-mono text-lg leading-8'>
			<p>{SITE_OWNER.handle.slice(1)}</p>
			<p>{SITE_OWNER.name}</p>
			<p lang='ja'>{SITE_OWNER.japaneseDisplayName}</p>
		</div>
	</header>

	<div class='mx-auto grid max-w-xs gap-8'>
		<figure class='m-0'>
			<img
				class='mx-auto aspect-square w-full max-w-xs rounded-full object-contain view-transition-name---profile'
				alt='ryoppippi'
				decoding='async'
				height='400'
				loading='eager'
				src='/ryoppippi.avif'
				srcset='/ryoppippi-174.avif 174w, /ryoppippi-348.avif 348w, /ryoppippi.avif 400w'
				sizes='(min-width: 40rem) 256px, calc(100vw - 4rem)'
				width='400'
			/>
		</figure>

		<figure class='m-0'>
			<img
				class='mx-auto h-auto w-full rounded-2xl object-contain opacity-80 transition-base hover:opacity-100'
				alt='haichu'
				decoding='async'
				height='529'
				loading='eager'
				src='/haichu.avif'
				style='view-transition-name:about-haichu'
				width='1011'
			/>
		</figure>

	</div>

	<div class='mx-auto mt-10 max-w-2xl text-base leading-8 text-text-500 opacity-70 dark:text-text-300'>
		<p>
			I work at Rork. I maintain
			<a class='underline decoration-text-300 underline-offset-4 transition-opacity hover:opacity-100' href='https://github.com/ryoppippi/ccusage' rel='noopener noreferrer' target='_blank'>ccusage</a>
			and
			<a class='underline decoration-text-300 underline-offset-4 transition-opacity hover:opacity-100' href='/works/oss/'>other open-source projects</a>.
		</p>
		<ul class='mt-6 list-disc space-y-2 pl-5'>
			{#each links as [label, href] (href)}
				<li>
					<a class='underline decoration-text-300 underline-offset-4 transition-opacity hover:opacity-100' href={`${SITE_ORIGIN}${href}`} rel='noopener noreferrer' target='_blank'>{label}</a>
				</li>
			{/each}
			<li>
				<a class='underline decoration-text-300 underline-offset-4 transition-opacity hover:opacity-100' href='/cv' rel='noopener noreferrer' target='_blank'>CV</a>
			</li>
		</ul>
	</div>
</article>
