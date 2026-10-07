---
title: Gym Database Simulation
start: "2024-12"
end: "2024-12"
context: course
contextDetail: CS 340
teamSize: 2
role: Created the sample data and wrote the SQL queries to fetch and add records
summary: PHP and MySQL app simulating a gym's members, workouts, exercises, sets and reps.
tags: [PHP, MySQL, SQL, CSS]
github: https://github.com/raymondcen/CS340Proj
status: complete
order: 80
---

Simulates running a gym, tracking members and their workout plans down to exercises, sets and reps. The database links members to dated workouts, each with a mental and physical rating, and workouts to exercises with reps, sets, rest time and weight. A junction table maps each exercise to the muscle groups it works.

- Created the sample data.
- Built the home, workouts and exercises pages. The workout and exercise pages use prepared statements, including a join from exercises to their muscle groups.
- Added create and delete for workouts and exercises, with input checks on dates and 1 to 5 ratings.
- Fixed a bug where members shared a workout ID.

**Key decision.** Scoped every workout to one member and one date. The add form rejects a second workout on the same date, the new workout's generated ID is reused to insert its rating and deleting a workout removes its rating row first.

My teammate built the member pages.
