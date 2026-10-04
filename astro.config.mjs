// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://andriy-viyatyk.github.io',
	integrations: [
		starlight({
			title: 'Andriy Viyatyk',
			description: 'Persephone, ai-vision, av-grid and Persephone boards: demos and documentation.',
			favicon: '/favicon.png',
			head: [{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } }],
			routeMiddleware: './src/routeData.ts',
			customCss: ['./src/styles/custom.css'],
			// Head adds the site's ai-vision model (src/scripts/site-model.ts) to every page.
			components: { Head: './src/components/Head.astro' },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/andriy-viyatyk' }],
			sidebar: [
				{ label: 'Home', link: '/' },
				{
					// One sub-group per core feature, each in its own folder under persephone/.
					label: 'Persephone',
					items: [
						{ label: 'Overview', slug: 'persephone' },
						{ label: 'Workspace', slug: 'persephone/workspace' },
						{
							label: 'Boards',
							items: [
								{ autogenerate: { directory: 'persephone/boards' } },
								{ label: 'Board catalog', link: '/boards/' },
							],
						},
						{ label: 'Site Extensions', slug: 'persephone/site-extensions' },
						{ label: 'Mneme', slug: 'persephone/mneme' },
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
			],
		}),
	],
});
