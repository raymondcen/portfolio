---
title: Unlimited Games but No Games
start: "2024-12"
end: "2025-07"
context: personal
teamSize: 2
role: Built Snake and started Pac-Man, covering the game logic and how each game displays
summary: Classic games rebuilt in C++ with raylib.
tags: [C++, raylib, CMake]
github: https://github.com/raymondcen/unlimited-games-but-no-games
status: archived
order: 70
---

Recreates classic games in C++ with raylib, with a planned Qt launcher. Snake and Tetris are playable.

- Built Snake: movement, apple spawning, wall and self collision, scoring, a home screen with three grid sizes and an end screen with play again and exit.
- Started Pac-Man, including the map and wall collision. It is unfinished.

**Key decision.** Stored the snake's body as a `std::deque` of grid cells. Each step pushes a new head and pops the tail, so a move costs the same at any length. The game draws at 60 FPS but steps the snake every 7 frames, which keeps movement speed separate from the frame rate.

Ivan Wong built Tetris and the launcher.
