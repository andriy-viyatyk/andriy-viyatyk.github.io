import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

/**
 * Keep the site navigation on every page. The blog plugin replaces the sidebar on its pages
 * with blog-only links; put the site navigation back and keep those links as a "Posts" group.
 */
export const onRequest = defineRouteMiddleware(async (context, next) => {
	const route = context.locals.starlightRoute;
	const siteNavigation = route.sidebar;
	await next();
	if (route.sidebar === siteNavigation) return;
	route.sidebar = [
		...siteNavigation,
		{ type: 'group', label: 'Posts', entries: route.sidebar, collapsed: false, badge: undefined },
	];
});
