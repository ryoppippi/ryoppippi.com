import { SITE_ORIGIN } from '../../consts.ts';
import { SITE_OWNER } from '../../site-owner.ts';
import ProfileImage from '../../components/ProfileImage/index.tsx';
import styles from './About.module.css';

const links = [
	['GitHub', `${SITE_ORIGIN}/github`],
	['LinkedIn', `${SITE_ORIGIN}/linkedin`],
	['Twitter', `${SITE_ORIGIN}/twitter`],
	['Bluesky', `${SITE_ORIGIN}/bsky`],
	['YouTube', `${SITE_ORIGIN}/youtube`],
	['CV', '/cv'],
] as const satisfies readonly (readonly [label: string, href: string])[];

/**
 * Renders the site owner's profile page.
 *
 * @returns The profile page fragment.
 */
export default function About() {
	return (
		<article class={styles.aboutPage}>
			<section class={styles.aboutCard}>
				<div class={styles.aboutCardRule} aria-hidden="true" />
				<div class={styles.aboutCardContent}>
					<div class={styles.aboutVisuals}>
						<figure class={styles.aboutPortrait}>
							<ProfileImage class={styles.aboutProfileImage} />
						</figure>
						<figure class={styles.aboutMascot}>
							<img
								class={styles.aboutMascotImage}
								alt="haichu"
								decoding="async"
								height="529"
								loading="eager"
								src="/haichu.avif"
								style="view-transition-name:about-haichu"
								width="1011"
							/>
						</figure>
					</div>
					<div class={styles.aboutCopy}>
						<p class={styles.aboutKicker}>... coder without ai</p>
						<p class={styles.aboutDescription}>
							<span class={styles.aboutName}>{SITE_OWNER.handle.slice(1)}</span>{' '}
							<span class={styles.aboutNameAlias}>
								({SITE_OWNER.name} / <span lang="ja">{SITE_OWNER.japaneseName}</span>)
							</span>{' '}
							builds coding agents, developer tools, and human-centred AI products. Maintains{' '}
							<a
								class={styles.aboutInlineLink}
								href="https://ccusage.com/gh"
								rel="noopener noreferrer"
								target="_blank"
							>
								ccusage
							</a>{' '}
							and{' '}
							<a class={styles.aboutInlineLink} href="/works/oss/">
								multiple OSS projects
							</a>
							. <span class={styles.aboutRole}>Founding Engineer</span> at{' '}
							<a
								class={styles.aboutInlineLink}
								href="https://rork.com/"
								rel="noopener noreferrer"
								target="_blank"
							>
								Rork
							</a>
							.
						</p>
						<ul class={styles.aboutLinks}>
							{links.map(([label, href]) => (
								<li class={styles.aboutLinkItem}>
									<a class={styles.aboutLink} href={href} rel="noopener noreferrer" target="_blank">
										<span>{label}</span>
										<span class={styles.aboutLinkArrow} aria-hidden="true">
											↗
										</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>
		</article>
	);
}
