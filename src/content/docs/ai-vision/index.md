---
title: ai-vision
description: An agent-facing object model over an application — one call tool, discovered through paths.
sidebar:
  label: Overview
  order: 1
---

**ai-vision** is an agent-facing object model over an application: a way to let an AI agent read
and drive your app through named paths. It is not computer vision or image analysis. Your app
exposes one `call` tool, and the agent discovers everything else from the object model itself.

## Why one `call` instead of many tools

- **Discovery is incremental.** The agent calls `call` with no path, reads the overview, and descends
  only into the branch the task is about.
- **A tool per action does not scale.** A single self-describing object model replaces hundreds of
  hand-written tools and costs nothing for the parts the agent is not looking at.
- **A wrong path teaches the agent the right one.** Members are allow-listed, so an unknown name
  returns the valid list plus "Did you mean …?".

It was built for [Persephone](/persephone/), where `call` replaced the entire MCP tool set.

## Install

```sh
npm install ai-vision
```

Source and full documentation: [github.com/andriy-viyatyk/ai-vision](https://github.com/andriy-viyatyk/ai-vision).
