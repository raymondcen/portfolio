import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Dates: quoted "YYYY-MM" strings everywhere, not z.coerce.date().
// A parsed Date is UTC midnight and renders as the previous day in Pacific time,
// and "YYYY-MM" strings sort correctly as plain strings.
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use a quoted "YYYY-MM" date');
const tags = z.array(z.string().min(1)).min(1);
const endNotBeforeStart = (d: { start: string; end?: string }) => !d.end || d.end >= d.start;
const endError = { message: 'end must not be before start', path: ['end'] };

// The entry id (slug) is the file name, for example fracfeedextractor.md -> fracfeedextractor.
// There is no slug field in frontmatter, so the two cannot drift apart.

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        // Required: every project has these
        title: z.string().min(1),
        start: month,
        context: z.enum(['capstone', 'course', 'hackathon', 'personal']),
        teamSize: z.number().int().positive(), // 1 means solo
        summary: z.string().min(1),
        tags,
        status: z.enum(['complete', 'archived', 'in-progress']),
        order: z.number().int(),

        // Optional
        end: month.optional(), // equal to start for a single-month project, absent means present
        contextDetail: z.string().optional(), // course number or event name and length
        teamNote: z.string().optional(), // nuance the number cannot carry
        role: z.string().optional(),
        metric: z.string().optional(), // prefix "Team result:" when it is not solely mine
        github: z.url().optional(),
        devpost: z.url().optional(),
        live: z.url().optional(),
        video: z.url().optional(),
        image: z.object({ src: image(), alt: z.string().min(1) }).optional(),
      })
      .refine(endNotBeforeStart, endError),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z
    .object({
      // Required: every entry has these
      title: z.string().min(1), // the role
      organization: z.string().min(1),
      location: z.string().min(1),
      start: month,
      type: z.string().min(1), // employment or enrollment type
      tags,
      order: z.number().int(),

      // Optional
      end: month.optional(), // absent means present
      unit: z.string().optional(), // department, lab or team inside the organization
      summary: z.string().optional(),
      teamSize: z.number().int().positive().optional(),
      role: z.string().optional(), // assigned team role, distinct from the title
      github: z.url().optional(),
    })
    .refine(endNotBeforeStart, endError),
});

export const collections = { projects, experience };
