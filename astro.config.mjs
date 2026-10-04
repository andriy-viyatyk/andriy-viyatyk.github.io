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
					label: 'Persephone',
					items: [{ autogenerate: { directory: 'persephone' } }],
				},
				{
					label: 'Persephone boards',
					items: [{ label: 'Board catalog', link: '/boards/' }],
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
			],
		}),
	],
});
