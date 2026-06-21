import { mount } from 'svelte';
import DarkModeToggle from './DarkModeToggle.svelte';
import './style.css';

const darkModeTarget = document.querySelector<HTMLElement>('[data-dark-mode]');
if (darkModeTarget != null) {
	mount(DarkModeToggle, { target: darkModeTarget });
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-filter]')) {
	button.addEventListener('click', () => {
		const pressed = button.ariaPressed !== 'true';
		button.ariaPressed = String(pressed);
		button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox]', !pressed);
		button.querySelector('span')?.classList.toggle('icon-[carbon--checkbox-checked]', pressed);
		const english = document.querySelector<HTMLButtonElement>('[data-filter="english"]')?.ariaPressed === 'true';
		const local = document.querySelector<HTMLButtonElement>('[data-filter="local"]')?.ariaPressed === 'true';
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
