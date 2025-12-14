import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export function load() {
	return redirect(301, resolve('/works/oss'));
}
