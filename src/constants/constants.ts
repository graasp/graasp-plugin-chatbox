export const VIEW_UNKNOWN_NAME = 'unknown';

export enum ITEM_TYPES {
  CHAT = 'chat',
}

// todo: get from graasp constants
export const CLIENT_HOSTS = [
  {
    name: 'builder',
    hostname: 'builder.graasp.org',
  },
  {
    name: 'player',
    hostname: 'player.graasp.org',
  },
  {
    name: 'explorer',
    hostname: 'explorer.graasp.org',
  },
];

export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum ACTION_TYPES {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  CLEAR = 'clear',
}

// todo: refactor from graasp utils? constants?
// match uuid v4
export const paths = {
  getChat:
    /^\/items\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\/chat$/,
  postMessage:
    /^\/items\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\/chat$/,
  patchMessage:
    /^\/items\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\/chat\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  deleteMessage:
    /^\/items\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\/chat\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  clearChat:
    /^\/items\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\/chat$/,
};
