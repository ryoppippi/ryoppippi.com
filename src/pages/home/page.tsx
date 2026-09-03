import ProfileImage from '@/components/ProfileImage';
import { SITE_ORIGIN } from '@/config/site.ts';
import styles from './Home.module.css';

const socials = [
	['icon-[line-md--github-loop]', 'GitHub profile', '/github'],
	['icon-[ph--git-pull-request-duotone]', 'Recent pull requests', '/pr'],
	['icon-[line-md--linkedin]', 'LinkedIn profile', '/linkedin'],
	['icon-[line-md--twitter]', 'Twitter profile', '/twitter'],
	['icon-[simple-icons--bluesky]', 'Bluesky profile', '/bsky'],
	['icon-[ri--youtube-line]', 'YouTube channel', '/youtube'],
] as const satisfies readonly (readonly [icon: string, label: string, href: string])[];

/**
 * Renders the home page fragment.
 *
 * @returns The home page fragment.
 */
export default function HomePage() {
	return (
		<>
			<article class={styles.homeIntro}>
				<div class={styles.homeProfileStage} data-home-profile>
					<ProfileImage class={styles.homeProfileImage} fetchpriority="high" />
				</div>
				<div class={styles.homeHeading}>
					<h1 class={styles.homeTitle} style="view-transition-name:title-ryoppippi">
						<span class={styles.homeHandle}>@ryoppippi</span>{' '}
						<span class={styles.homeRole}>Engineer</span>
					</h1>
				</div>
			</article>

			<div class={styles.homeSocialsFrame}>
				<article class={styles.homeSocials}>
					{socials.map(([icon, label, href]) => (
						<div class={styles.homeSocialCard}>
							<a
								aria-label={label}
								href={`${SITE_ORIGIN}${href}`}
								rel="noopener noreferrer"
								target="_blank"
							>
								<span class={`${icon} ${styles.homeSocialIcon}`} aria-hidden="true" />
							</a>
						</div>
					))}
				</article>
			</div>
		</>
	);
}
