# storybook/interaction-2-test

## Features

This is a storybook addon that generates unit test (Jest for now) based on user interaction on the Storybook component UI

[Brainstorm board](https://www.figma.com/board/2JFn9j3ux6397OT5DRUOjF/Interaction-2-Test-Brainstorming-board?node-id=0-1&p=f&t=YIrYEEgcgPWMtcP0-0)
<br /><sup></sup>

## Extension Settings

Add this to the `main.js` addons array and it should work straight away.

## Known Issues
Expect statement is weak at guessing user intents, and hence is not very reliable at the moment.

## Dev Notes
When `npm install` the local path to the addon, this creates a symlink that can automatically updates the addon from the storybook project side. However, as soon as, the instance of your IDE is closed (for whatever reason), you will need to delete `package.json` as well as `node_modules`, and reinstall the addon again so it won't cache.

## Release Notes

## References
[Svelte Logo](https://en.m.wikipedia.org/wiki/File:Svelte_Logo.svg)

### 1.0.0
Expect statement is weak at guessing user intents, and hence is not very reliable at the moment.
