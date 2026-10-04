import { getCollection } from 'astro:content';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

const RECENT_POST_COUNT = 5;

type SidebarEntry = App.Locals['starlightRoute']['sidebar'][number];

/**
 * The sidebar is the site's navigation and is the same on every page. The blog plugin replaces
 * it with blog-only links on its pages; this puts the site navigation back everywhere and lists
 * the most recent posts in the "Posts" group defined in astro.config.mjs.
 */
export const onRequest = defineRouteMiddleware(async (context, next) => {
	const route = context.locals.starlightRoute;
	const siteNavigation = route.sidebar;
	await next();

	const posts = (await getCollection('docs', (entry) => entry.id.startsWith('blog/') && !entry.data.draft))
		.filter((entry) => entry.data.date)
		.toSorted((a, b) => b.data.date!.getTime() - a.data.date!.getTime())
		.slice(0, RECENT_POST_COUNT);

	const currentPath = context.url.pathname.replace(/\/?$/, '/');
	const recentPosts: SidebarEntry[] = posts.map((post) => {
		const href = `/${post.id}/`;
		return { type: 'link', label: post.data.title, href, isCurrent: href === currentPath, badge: undefined, attrs: {} };
	});

	// On other pages the plugin also adds its own top-level link to the blog into this same array;
	// the "Posts" group already covers it.
	route.sidebar = siteNavigation
		.filter((entry) => !(entry.type === 'link' && entry.href === '/blog/'))
		.map((entry) =>
			entry.type === 'group' && entry.label === 'Posts'
				? { ...entry, entries: [...entry.entries, ...recentPosts] }
				: entry,
		);
});
