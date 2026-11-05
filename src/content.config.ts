import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const schema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  // `date` sorts the lists; `period` is shown instead of it when set.
  date: z.coerce.date(),
  period: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema,
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema,
});

export const collections = { blog, projects };
