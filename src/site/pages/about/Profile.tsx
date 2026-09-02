import { SITE_ORIGIN } from '../../consts.ts';
import ProfileImage from '../../components/ProfileImage/index.tsx';
import styles from './Profile.module.css';

const links = [
	['GitHub', `${SITE_ORIGIN}/github`],
	['LinkedIn', `${SITE_ORIGIN}/linkedin`],
	['Twitter', `${SITE_ORIGIN}/twitter`],
	['Bluesky', `${SITE_ORIGIN}/bsky`],
	['YouTube', `${SITE_ORIGIN}/youtube`],
	['CV', '/cv'],
] as const satisfies readonly (readonly [label: string, href: string])[];

type ProfileProps = {
	content: string;
};

/**
 * Renders the site owner's profile page around its colocated MDX content.
 *
 * @param props - Rendered MDX content for the profile page.
 * @returns The profile page fragment.
 */
export default function Profile(props: ProfileProps) {
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
						<div innerHTML={props.content} />
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
