import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', (p) => !p.data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return rss({
    title: `${SITE.name} — блог`,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `${base}/blog/${p.id}/`,
      categories: p.data.tags,
    })),
    customData: `<language>ru</language>`,
  });
}
