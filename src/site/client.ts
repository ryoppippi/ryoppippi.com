import './style.css';

function applyTheme(theme: 'dark' | 'light'): void {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	localStorage.setItem('theme', theme);
}

const storedTheme = localStorage.getItem('theme');
applyTheme(storedTheme === 'dark' || (storedTheme == null && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');

document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
	applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
});

for (const input of document.querySelectorAll<HTMLInputElement>('[data-filter]')) {
	input.addEventListener('change', () => {
		const english = document.querySelector<HTMLInputElement>('[data-filter="english"]')?.checked === true;
		const local = document.querySelector<HTMLInputElement>('[data-filter="local"]')?.checked === true;
		for (const item of document.querySelectorAll<HTMLElement>('.blog-item')) {
			item.hidden = (english && item.dataset.lang !== 'en') || (local && item.dataset.origin !== 'local');
		}
	});
}

const sponsorImage = document.querySelector<HTMLImageElement>('[data-sponsor-image]');
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-sponsor-view]')) {
	button.addEventListener('click', () => {
		if (sponsorImage == null) {
			return;
		}
		const circles = button.dataset.sponsorView === 'circles';
		sponsorImage.src = `https://sponsors.ryoppippi.com/${circles ? 'sponsors.circles.svg' : 'sponsors.past.svg'}`;
		sponsorImage.alt = circles ? 'GitHub Sponsors' : 'Sponsor Tiers';
		for (const candidate of document.querySelectorAll<HTMLElement>('[data-sponsor-view]')) {
			candidate.classList.toggle('opacity-70', candidate === button);
			candidate.classList.toggle('opacity-20', candidate !== button);
		}
	});
}
