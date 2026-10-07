---
title: DubBetter Ring
start: "2025-10"
end: "2025-10"
context: hackathon
contextDetail: DubHacks '25, 24 hours
teamSize: 3
role: Recorded training videos, worked on model training and refactored the web client's socket module
summary: Raspberry Pi doorbell camera that classifies visitor activity and streams events to a web client.
tags: [Python, TensorFlow Lite, OpenCV, Keras, Socket.IO, React, Vite, Raspberry Pi 5]
github: https://github.com/raymondcen/DubHacks2025
devpost: https://devpost.com/software/dubbetter-ring
status: archived
order: 40
---

A privacy-first smart doorbell that keeps footage away from third-party companies. A USB camera on a Raspberry Pi 5 feeds AI models that classify activity at the door. The Pi acts as the backend and pushes events and a live feed to a React client over WebSockets.

- Recorded our own doorbell-scenario videos as training data, since no suitable dataset existed.
- Worked on training the activity model, which labels 5 activity classes and was trained on 365 sequences.
- Refactored the client socket module into a dynamic event registry. Removed a second per-event registration in `subscribe()` that made each callback fire twice per event, once through the global dispatcher and once directly.

**Key decision (team).** A two-stage model: a TFLite detector finds people, then a small Keras classifier labels sequences of their positions and is exported to TFLite. The model stayed only a few kilobytes.
