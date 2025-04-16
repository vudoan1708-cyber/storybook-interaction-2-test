// Not needed now
// import { addons, Channel } from '@storybook/addons';

// import { STORIES_LOADED_EVENT_NAME } from './helpers/constants';

// import { EnrichedStory } from '../types';

// const waitUntilChannelReady = (): Promise<Channel> => {
//   return new Promise((resolve) => {
//     const check = () => {
//       const channel = addons.getChannel();
//       if (channel) {
//         resolve(channel);
//       } else {
//         requestAnimationFrame(check);
//       }
//     };
//     check();
//   });
// };

// waitUntilChannelReady().then((channel: Channel) => {
//   const stories = (window as any).__STORYBOOK_STORY_STORE__?.raw?.() || [];
//   const enrichedStories: EnrichedStory[] = stories
//     .map((s: any) => ({
//       id: s.id,
//       kind: s.kind,
//       name: s.name,
//       importPath: s.parameters?.fileName || null,
//     }))
//     .filter((story: EnrichedStory) => story.importPath);
  
//   console.log('[preview] enriched stories', enrichedStories);
  
//   channel.emit(STORIES_LOADED_EVENT_NAME, {
//     stories: enrichedStories,
//   });
// });
