import { ITEM_TYPES, VIEW_UNKNOWN_NAME } from '../src/constants/constants';
import { ITEM_ID } from './fixtures/mock-constants';

export const buildChatUrl = (itemId, messageId?) => {
  let url = `/items/${itemId}/chat`;
  if (messageId) {
    url += `/${messageId}`;
  }
  return url;
};

export const GRAASP_ACTOR = { id: '12345678-1234-1234-1234-123456789012' };

export const checkActionData = (savedAction, args) => {
  const {
    actionType,
    message,
    itemType = ITEM_TYPES.CHAT,
    itemId = ITEM_ID,
    view = VIEW_UNKNOWN_NAME,
    memberId = GRAASP_ACTOR.id,
  } = args;
  expect(savedAction.itemId).toEqual(itemId);
  expect(savedAction.itemType).toEqual(itemType);
  expect(savedAction.memberId).toEqual(memberId);
  expect(savedAction.actionType).toEqual(actionType);
  expect(savedAction.view).toEqual(view);
  expect(savedAction.extra.message).toEqual(message);
  expect(savedAction.geolocation).toBeFalsy();
};
