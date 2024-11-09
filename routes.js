/** @satisfies {import('@ryoppippi/vite-plugin-cloudflare-redirect').Options['entries']} */
export const Route = /** @as{const} */([
	{ from: '/cv', to: 'https://cv.ryoppippi.com' },
	{ from: '/cv-pdf', to: 'https://cv.ryoppippi.com/pdf' },
	{ from: '/icon', to: '/ryoppippi.jpg' },
	{ from: '/github', to: 'https://github.com/ryoppippi' },
	{ from: '/gh', to: 'https://github.com/ryoppippi' },
	{ from: '/gh-by-stars', to: 'https://github.com/ryoppippi?tab=repositories&sort=stargazers' },
	{ from: '/pr', to: 'https://pr.ryoppippi.com' },
	{ from: '/zenn', to: 'https://zenn.dev/ryoppippi' },
	{ from: '/linkedin', to: 'https://www.linkedin.com/in/ryoppippi/' },
	{ from: '/twitter', to: 'https://x.com/ryoppippi' },
	{ from: '/bsky', to: 'https://bsky.app/profile/ryoppippi.com' },
	{ from: '/reddit', to: '/https://www.reddit.com/user/ryoppippi' },
	{ from: '/youtube', to: 'https://www.youtube.com/channel/UCJbUM-yZx6mESJw82-OpMuQ' },
]);
