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
		<article class={styles.page}>
			<section class={styles.profileCard}>
				<div class={styles.cardRule} aria-hidden="true" />
				<div class={styles.cardContent}>
					<div class={styles.visuals}>
						<figure class={styles.portrait}>
							<ProfileImage class={styles.profileImage} />
						</figure>
						<figure class={styles.mascot}>
							<img
								class={styles.mascotImage}
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
					<div class={styles.copy}>
						<h1 class={styles.heading}>ryoppippi</h1>
						<p class={styles.kicker}>
							<em>... coder without ai</em>
						</p>
						<p class={styles.description}>
							<strong class={styles.name}>{SITE_OWNER.handle.slice(1)}</strong>{' '}
							<span class={styles.alias}>
								({SITE_OWNER.name} / <span lang="ja">{SITE_OWNER.japaneseName}</span>)
							</span>{' '}
							builds coding agents, developer tools, and human-centred AI products. Maintains{' '}
							<a
								class={styles.inlineLink}
								href="https://ccusage.com/gh"
								rel="noopener noreferrer"
								target="_blank"
							>
								ccusage
							</a>{' '}
							and{' '}
							<a class={styles.inlineLink} href="/works/oss/">
								multiple OSS projects
							</a>
							. <span class={styles.role}>Founding Engineer</span> at{' '}
							<a
								class={styles.inlineLink}
								href="https://rork.com/"
								rel="noopener noreferrer"
								target="_blank"
							>
								Rork
							</a>
							.
						</p>
						<ul class={styles.links}>
							{links.map(([label, href]) => (
								<li class={styles.linkItem}>
									<a class={styles.link} href={href} rel="noopener noreferrer" target="_blank">
										<span>{label}</span>
										<span class={styles.linkArrow} aria-hidden="true">
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
