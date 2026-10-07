---
title: TalkTask
start: "2025-01"
end: "2025-03"
context: course
contextDetail: CS 362
teamSize: 6
role: Voice commands and task management UI
summary: Voice-controlled to-do web app with AI task suggestions.
tags: [React, Node.js, Express, MongoDB, Web Speech API, Tailwind CSS, Axios, Gemini API]
github: https://github.com/IvanW5X/CS362-Winter2025-Team20-TalkTask
live: https://talktask.netlify.app/
image:
  src: ../../assets/projects/talktask-voice-input.png
  alt: "Voice input flowchart. The transcript is parsed and checked for valid delimiters, missing fields get default values and the result is sent to the task component as a task object."
status: complete
order: 30
---

Personal to-do tracker with speech recognition for hands-free task management. It has category and calendar views and Gemini-suggested tasks, and was designed with accessibility in mind.

- Built the voice command pipeline: speech capture with the Web Speech API, then backend transcript parsing and command execution. Added the add, remove and mark grammar and priority-word conversion.
- Built the task management UI: add and edit popups, filtering and sorting and auto-sort by priority. Moved the navigation to Tailwind.
- Built the frontend for Gemini task suggestions and fixed a suggest-task time bug. A teammate built the Gemini backend.
- Added database error handling for add, remove and edit, restructured the controllers and routes and fixed user ID scoping in categories.
- Wrote the INSTALL.md and SETUP.md guides.

**Key decision.** Moved transcript parsing and command execution from the frontend to the backend, so the browser only captures speech and sends the transcript.
