import { EventType } from "../types";

const getElementByDataTestId = (target: HTMLElement | null | undefined, eventType: EventType) => {
  if (target?.parentElement?.querySelector('#root')) {
    console.error('No data-testid found in clicked element and its parent elements');
    return null;
  }
  // if target element has a data-testid attribute and has the same event type
  if (target?.getAttribute('data-testid')) {
    console.log('target', target);
    return target;
  }
  return getElementByDataTestId(target?.parentElement, eventType);
};

export const onElementClick = (e: Event) => {
  return getElementByDataTestId(e?.target as HTMLElement, 'click');
};
