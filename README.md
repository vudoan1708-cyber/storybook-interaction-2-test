# storybook/interaction-2-test

## Features

This is a storybook addon that generates unit test (Jest for now) based on user interaction on the Storybook component UI

[Brainstorm board](https://www.figma.com/board/2JFn9j3ux6397OT5DRUOjF/Interaction-2-Test-Brainstorming-board?node-id=0-1&p=f&t=YIrYEEgcgPWMtcP0-0)
<br /><sup></sup>

## Extension Settings
Storybook version 6+, any major version bump from version 6 will not work with this addon.
Add this to the `main.js` addons array and it should work straight away.

## Known Issues
Expect statement is weak at guessing user intents, and hence is not very reliable at the moment.

## Dev Notes
When `npm install` the local path to the addon, this creates a symlink that can automatically updates the addon from the storybook project side. However, as soon as, the instance of your IDE is closed (for whatever reason), you will need to delete `package.json` as well as `node_modules`, and reinstall the addon again so it won't cache.

## Release Notes

## References
[Svelte Logo](https://en.m.wikipedia.org/wiki/File:Svelte_Logo.svg)

## Installation

Use as a dev dependency:

```sh
npm i -D interaction-2-test
```

## Usage
After installing the package as a dev dependency, you have 2 options to define actors:
1. Locally under the parameters object in the Meta function / component for each `stories` file.
2. Globally at the root of a storybook project (the file is `i2t.config.json` and needs to have the exact same data structure defined in the Vocabulary section)

## Vocabulary
- Actors: Your `data-testid`s of elements that involve in a recording session.
- Scene: What your `actors` will perform in a recording session (input, change, click, hover,...)<br />
Example:
```json
{
  'button-testid': 'click',
  'input-testid': 'change'
}
```

### 1.1.0
- Expect statement is weak at guessing user intents, and hence is not very reliable at the moment.
### 1.2.0
- Monkey patched `fetch` to collate API calls and make the `expect` stage more powerful at predicting expected outcome.
### 1.2.1
- `preview` file was loaded twice, it seems that defining it in the `exports` field from `package.json` automatically imports it, so removing the `previewAnnotations` seems to fix it.
### 1.3.0
- Default values for the `textarea` field when building an `expect` statement, particularly, from the collection of API calls, all the info, such as url, call times, call methods...
### 1.3.1
- Minor updates on the import statements...
### 1.3.2
- `fetch` will now stay latched on every story change event. Although new issue found with some early calls cannot be picked up by the preview.
### 1.3.3
- Add a warning to the expect statement builder.
- Fix the auto-record settings on first load.
### 1.4.0
- Fix issue with endpoint calls of the same URL but different methods get swallowed.
- Allow defining actors globally in a repo instead of locally in each stories file.
### 1.4.1
- Remove logs.
