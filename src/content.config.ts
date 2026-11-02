import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  loader: file('src/data/publications.yaml'),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    type: z.enum(['article', 'conference', 'preprint', 'thesis', 'book', 'talk', 'report']),
    abstract: z.string().optional(),
    selected: z.boolean().default(false),
    open: z.boolean().default(false),
    links: z
      .object({
        pdf: z.string().optional(),
        doi: z.coerce.string().optional(),
        arxiv: z.coerce.string().optional(),
        code: z.string().optional(),
        slides: z.string().optional(),
        url: z.string().optional(),
      })
      .default({}),
    bibtex: z.string().optional(),
  }),
});

export const collections = { blog, publications };
