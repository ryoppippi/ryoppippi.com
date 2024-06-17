import sortOn from 'sort-on';
import { parseJSON } from 'date-fns';

import { posts as rssPosts } from './rss';
import { posts as blogPosts } from './posts';

const allPosts = [...rssPosts, ...blogPosts].map(item => ({ ...item, pubDate: parseJSON(item.pubDate) }));

export const posts = sortOn(allPosts, ['-pubDate']);
