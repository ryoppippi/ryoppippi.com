<script lang='ts'>
	import { SITE_ORIGIN } from '../consts.ts';
	import { SITE_OWNER } from '../site-owner.ts';

	const links = [
		['GitHub', `${SITE_ORIGIN}/github`],
		['LinkedIn', `${SITE_ORIGIN}/linkedin`],
		['Twitter', `${SITE_ORIGIN}/twitter`],
		['Bluesky', `${SITE_ORIGIN}/bsky`],
		['YouTube', `${SITE_ORIGIN}/youtube`],
		['CV', '/cv'],
	] as const;
</script>

<article class='mx-auto mt-8 max-w-4xl px-2 pb-20'>
	<section class='about-card relative isolate mx-auto overflow-hidden rounded-[2rem] border border-base px-5 py-10 shadow-[0_2rem_6rem_#00000012] dark:shadow-[0_2rem_6rem_#00000045] sm:px-10 sm:py-12'>
		<div class='pointer-events-none absolute inset-x-12 top-0 h-px bg-accent-100 opacity-50' aria-hidden='true'></div>

		<div class='relative'>
			<div class='mx-auto grid max-w-xs gap-4'>
				<figure class='m-0'>
					<img
						class='mx-auto aspect-square w-1/2 rounded-full object-contain shadow-[0_1.5rem_4rem_#0004] ring-1 ring-[#8885] view-transition-name---profile md:size-64'
						alt='ryoppippi'
						decoding='async'
						height='400'
						loading='eager'
						src='/ryoppippi.avif'
						srcset='/ryoppippi-174.avif 174w, /ryoppippi-348.avif 348w, /ryoppippi.avif 400w'
						sizes='(min-width: 48rem) 256px, calc(50vw - 2rem)'
						width='400'
					/>
				</figure>

				<figure class='m-0'>
					<img
						class='mx-auto h-auto w-4/5 max-w-64 object-contain opacity-85 drop-shadow-[0_1rem_2rem_#0003] transition-base hover:scale-[1.02] hover:opacity-100'
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

			<div class='mx-auto mt-10 max-w-2xl border-t border-base pt-8'>
				<p class='font-mono text-lg italic text-text-400 opacity-60'>... coder without ai</p>
				<p class='mt-5 text-pretty text-lg leading-8 text-text-600 dark:text-text-300 sm:text-xl sm:leading-9'>
					<span class='font-semibold text-text-800 dark:text-text-100'>{SITE_OWNER.handle.slice(1)}</span>
					<span class='font-mono text-sm text-text-400'>({SITE_OWNER.name} / <span lang='ja'>{SITE_OWNER.japaneseName}</span>)</span>
					builds coding agents, developer tools, and human-centred AI products. Maintains
					<a class='font-medium text-inherit underline decoration-[#8886] underline-offset-4 transition-base hover:decoration-accent-100' href='https://github.com/ryoppippi/ccusage' rel='noopener noreferrer' target='_blank'>ccusage</a>
					and
					<a class='font-medium text-inherit underline decoration-[#8886] underline-offset-4 transition-base hover:decoration-accent-100' href='/works/oss/'>other open-source projects</a>.
					<span class='font-medium text-text-700 dark:text-text-200'>Founding Engineer</span> at
					<a class='font-medium text-inherit underline decoration-[#8886] underline-offset-4 transition-base hover:decoration-accent-100' href='https://rork.com/' rel='noopener noreferrer' target='_blank'>Rork</a>.
				</p>

				<ul class='mt-10 grid list-none gap-x-10 p-0 sm:grid-cols-2'>
					{#each links as [label, href] (href)}
						<li class='border-b border-base'>
							<a class='group flex items-center justify-between py-3 font-mono text-sm text-text-500 no-underline transition-base hover:text-accent-100 dark:text-text-300' href={href} rel='noopener noreferrer' target='_blank'>
								<span>{label}</span>
								<span class='opacity-25 transition-base group-hover:translate-x-1 group-hover:opacity-80' aria-hidden='true'>↗</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>
</article>
