import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Month precision as "YYYY-MM" strings: Date objects shift to the previous day in Pacific time,
// and these strings sort correctly as plain strings.
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use a quoted "YYYY-MM" date');
const tags = z.array(z.string()).min(1);
const endNotBeforeStart = (d: { start: string; end?: string }) => !d.end || d.end >= d.start;
const endError = { message: 'end must not be before start', path: ['end'] };

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        start: month,
        end: month,
        summary: z.string(),
        metric: z.string().optional(),
        tags,
        github: z.url().optional(),
        image: z.object({ src: image(), alt: z.string().min(1) }).optional(),
        order: z.number().int(),
      })
      .refine(endNotBeforeStart, endError),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z
    .object({
      title: z.string(),
      organization: z.string(),
      location: z.string(),
      start: month,
      end: month.optional(),
      tags,
      order: z.number().int(),
    })
    .refine(endNotBeforeStart, endError),
});

export const collections = { projects, experience };
