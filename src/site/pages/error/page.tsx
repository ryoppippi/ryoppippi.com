import styles from './Error.module.css';

/**
 * Renders the not-found page body.
 *
 * @returns The not-found page content.
 */
export default function ErrorPage() {
	return (
		<div class={styles.errorPage}>
			<h1 class={styles.errorCode}>404</h1>
			<p class={styles.errorMessage}>Page not found</p>
			<a class={styles.errorHomeLink} href="/">
				Back home
			</a>
		</div>
	);
}
