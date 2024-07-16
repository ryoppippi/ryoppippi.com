import { sequence } from '@sveltejs/kit/hooks';
import { meta } from './handles/meta';

/** 最終的な hooks */
export const handle = sequence(meta);
