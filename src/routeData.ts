import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

const DEFAULT_IMAGE = 'https://andriy-viyatyk.github.io/media/persephone-home.jpg';

/**
 * Gives every page a preview image for link cards on Reddit, X, Slack and the like. A page picks
 * its own with an `og:image` meta in its frontmatter `head` (usually its demo clip's poster);
 * pages without one get the home page's.
 */
export const onRequest = defineRouteMiddleware((context) => {
	const { head } = context.locals.starlightRoute;
	if (!head.some((tag) => tag.tag === 'meta' && tag.attrs?.property === 'og:image')) {
		head.push({ tag: 'meta', attrs: { property: 'og:image', content: DEFAULT_IMAGE } });
	}
});
