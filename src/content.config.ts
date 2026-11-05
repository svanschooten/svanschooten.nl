import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const schema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  date: z.coerce.date(),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema,
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  // `date` sorts the list; `period` is shown instead of it when set.
  schema: schema.extend({ period: z.string().optional() }),
});

export const collections = { blog, projects };
