import { APICallRecord, ExpectStatement } from "../../types";

export const ADDON_NAME = 'interaction-2-test';

export const ADDON_ID = `storybook/${ADDON_NAME}`;
export const PANEL_ID = `${ADDON_ID}/panel`;

export const API_CALL_EVENT_NAME = `${ADDON_ID}/api-call-record-collections`;

export const WS_PORT = 42999;

export const DEFINE_ACTORS = 'i2t-actors';

export const FRAMEWORK_TO_LOGO = {
  svelte: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg',
  react: '',
  angular: '',
};

export const LOCAL_STORAGE_KEY = `storybook/${ADDON_NAME}/settings`;

export const EXPECT_STATEMENTS: Array<ExpectStatement> = [
  { keyword: 'toBeInTheDocument', argumentTypes: [] },
  { keyword: 'toBeNull', argumentTypes: [] },
  { keyword: 'toBeUndefined', argumentTypes: [] },
  { keyword: 'toBe', argumentTypes: [ 'any' ] },
  { keyword: 'toHaveTextContent', argumentTypes: [ 'string' ] },
  { keyword: 'toHaveStyle', argumentTypes: [ 'object | string' ] },
  { keyword: 'toHaveLength', argumentTypes: [ 'number' ] },
  { keyword: 'toEqual', argumentTypes: [ 'any' ] },
  { keyword: 'toStrictEqual', argumentTypes: [ 'any' ] },
  { keyword: 'toHaveBeenCalled', argumentTypes: [] },
  { keyword: 'toHaveBeenCalledWith', argumentTypes: [ 'any' ] },
  { keyword: 'toHaveBeenCalledTimes', argumentTypes: [ 'number' ] },
];

export const EXPECT_OUTCOME_API_CALL_MAPPER: { [x in ExpectStatement['keyword']]?: keyof APICallRecord[string] } = {
  toHaveBeenCalledTimes: 'times',
  toHaveBeenCalledWith: 'requestBody',
};
