---
title: BrainBurst
start: "2025-04"
end: "2025-04"
context: hackathon
contextDetail: BeaverHacks 2025, 24 hours
teamSize: 3
role: Managed the database, implemented CRUD and wrote the Supabase queries
summary: Swipeable flashcard app with Gemini-generated answer choices.
tags: [React, JavaScript, Supabase, PostgreSQL, Tailwind CSS, Swiper.js, Gemini API, Vite]
github: https://github.com/raymondcen/brainburst
devpost: https://devpost.com/software/brainburst
video: https://www.youtube.com/watch?v=o_bqAuwcAtI
status: archived
order: 50
---

A TikTok-style infinite scroll of flashcards meant to replace doom scrolling with quick learning. Learn mode shows term and definition cards, and practice mode has Gemini generate wrong answers around the real one. The layout is mobile-first.

- Built the Supabase data layer, including the `get_distinct_categories` RPC.
- Wrote the row-level security policies in the Supabase project.
- Built the flashcard add, edit and category popups and the flashcard manager.

**Key decision (team).** A few hours in, we learned Supabase provides auth, so we switched to Supabase Auth and direct Supabase queries from the frontend. This replaced the planned Express server.

Ivan Wong covered software design, auth and the AI setup. Gabriel Valdez covered UI styling and animations.
