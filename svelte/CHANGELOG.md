# Change Log

All notable changes to the "interaction-2-test" storybook addon will be documented in this file.

## [13/04/2025]

- Initial setup and working prototype<br />
- Set up esbuild to compile code into commonjs and make it compatible with older browsers.
- `external` field in `esbuild.config.js` file needs using to exclude `svelte`, `@storybook` packages, `react`, `react-dom` and any package that is already a library installed from the storybook project. This is so that there will be no conflict of libraries when addon is installed on SB projects.
- From the addon side, always ensure `@storybook/addons` library version is the same as the storybook libraries used in the storybook projects. Otherwise, `addons.register()` method won’t work.
  ### Constraints:
    - Add the manager.ts (originally recorder.ts) file to the `managerEntries` in storybook project's `main.js` file, which is not a good practice in production use.
## [14/04/2025]
- Created the UI for the new panel.
- Use [mui components](https://mui.com/material-ui/) for quick development.
  ### Constraints:
    - Struggling to update the file structure to mirror other addons where they are injected to the `addons` array, not `managerEntries`
## [15/04/2025]
- Attempted to use preset.ts as a Node app to read file content and parse it using babel and svelte compiler. This was thought to be used to pick up `addEventListener` or any `on:` directives from `Svelte` syntax.
- A more thorough look into the preset file opened my mind, when I realised, the manager (UI) file could be injected to `managerEntries` from within preset. Then preset would become the entry file of the addon. This should fix the issue with the odd inclusion of the addon.
## [16/04/2025]
- Issue with addon not being registered correctly when using preset as the entry file.
- Turns out, I just need to spread the existing entries in the `managerEntries` array, then reference it as an addon in the addons array field from `main.js`.
## [17/04/2025]
- There should be a way to collate all the stories without having to walk the directory. From the `STORY_RENDERED` emitted event, we can know the file path to the current story on the screen and that can be a useful info passed down to preset from the manager side. This way, we can parse the file content to look for event listeners and handlers.
- This means we need to set up some sort of communication between these 2 files, as preset can only run once from the startup process and then dies.
- Websocket was then implemented successfully to receive data from the manager, even during the lifecycle of the UI when preset side is no longer in use.
- Turns out, we don’t need to use the preset side to traverse and parse file content at all.
What we can do is define our own “actors and scenes” from Storybook parameters attribute, and pick the value up from the UI side easily.
## [18/04/2025]
- Learned a bit about `Abstract Syntax Tree` (AST) and decided to create my own quick mini version of `Jest syntax tree` (JST).
- Created the list-based UI for the recorded steps based on JST created from user interactions.
## [19/04/2025]
- Alert error and prevent recording when i2t-actors property is not defined / found in Meta component.
- Turn off an ongoing recording session when current story is changed.
<br />
