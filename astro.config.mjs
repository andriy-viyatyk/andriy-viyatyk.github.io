// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
	site: 'https://andriy-viyatyk.github.io',
	integrations: [
		starlight({
			title: 'Andriy Viyatyk',
			description: 'Persephone, ai-vision, av-grid and Persephone boards: demos, documentation and posts.',
			favicon: '/favicon.png',
			head: [{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } }],
			routeMiddleware: './src/routeData.ts',
			customCss: ['./src/styles/custom.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/andriy-viyatyk' }],
			plugins: [
				starlightBlog({
					title: 'Posts',
					authors: {
						andriy: {
							name: 'Andriy Viyatyk',
							url: 'https://github.com/andriy-viyatyk',
						},
					},
				}),
			],
			sidebar: [
				{
					// One sub-group per core feature, each in its own folder under persephone/.
					label: 'Persephone',
					items: [
						{ label: 'Overview', slug: 'persephone' },
						{
							label: 'Boards',
							items: [
								{ autogenerate: { directory: 'persephone/boards' } },
								{ label: 'Board catalog', link: '/boards/' },
							],
						},
					],
				},
				{
					label: 'ai-vision',
					items: [{ autogenerate: { directory: 'ai-vision' } }],
				},
				{
					label: 'av-grid',
					items: [
						{ autogenerate: { directory: 'grid' } },
						{ label: 'Live demo ↗', link: 'https://andriy-viyatyk.github.io/av-grid/' },
					],
				},
				{
					// src/routeData.ts appends the most recent posts to this group.
					label: 'Posts',
					items: [{ label: 'All posts', link: '/blog/' }],
				},
			],
		}),
	],
});
