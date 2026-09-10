<div data-nosnippet class="siteNavigationActions">
	<a class="siteCvLink" href="/cv" rel="noopener noreferrer" target="_blank">
		<span class="siteCvLabel">
			cv <span class={['icon-[line-md--download-outline]', 'siteCvIcon']} aria-hidden="true"></span>
		</span>
	</a>
	<div class="siteTools">
		<span class="siteThemeControl" data-dark-mode></span>
		<a class="siteToolLink" aria-label="RSS feed" href="/feed.xml">
			<span class="icon-[line-md--rss]" aria-hidden="true"></span>
			<span class="visuallyHidden">RSS feed</span>
		</a>
		<a
			class="siteToolLink"
			aria-label="Source code on GitHub"
			href="https://github.com/ryoppippi/ryoppippi.com"
			rel="noopener noreferrer"
			target="_blank"
		>
			<span class="icon-[teenyicons--github-solid]" aria-hidden="true"></span>
			<span class="visuallyHidden">Source code</span>
		</a>
	</div>
</div>

<style>
	.siteNavigationActions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}
	.siteNavigationActions {
		align-items: center;
	}

	.siteCvLink {
		position: relative;
		display: block;
		flex-shrink: 0;
		white-space: nowrap;
	}
	.siteCvLink {
		width: 2.5rem;
		padding: 0;
	}
	.siteCvLabel,
	.siteToolLink,
	.siteThemeControl {
		display: flex;
		align-items: center;
	}
	.siteCvIcon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}
	.siteTools {
		display: flex;
		width: 4.375rem;
		justify-content: space-between;
	}
	.siteTools :global(button) {
		display: flex;
		align-items: center;
		margin-block: auto;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
	}
	.siteToolLink {
		margin-block: auto;
	}
	.visuallyHidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
