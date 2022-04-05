import {
  ActionHandlerInput,
  BaseAction,
  getGeolocationIp,
  getView,
} from 'graasp-plugin-actions';
import {
  ACTION_TYPES,
  ITEM_TYPES,
  METHODS,
  paths,
} from '../constants/constants';
import { Member } from 'graasp';

declare module 'fastify' {
  export interface FastifyRequest {
    member: Member;
  }
}

export const createChatActionHandler = async (
  payload: string,
  actionInput: ActionHandlerInput,
): Promise<BaseAction[]> => {
  const { request, log } = actionInput;
  // function called each time there is a request in the items in graasp (onResponse hook in graasp)
  // identify and check the correct endpoint of the request
  // check that the request is ok
  const { headers, member, method, url, ip, params } = request;

  // warning: this is really dependent on the url -> how to be more safe and dynamic?
  const itemId: string = (params as { itemId: string })?.itemId;

  const geolocation = getGeolocationIp(ip);
  const view = getView(headers);

  const chatData = JSON.parse(payload);

  const actionsToSave = [];
  const actionBase = {
    memberId: member.id,
    memberType: member.type,
    extra: { memberId: member.id, itemId, message: chatData },
    view,
    itemId,
    itemType: ITEM_TYPES.CHAT,
    geolocation,
  };

  // identify the endpoint with method and url
  switch (method) {
    case METHODS.POST:
      switch (true) {
        case paths.postMessage.test(url):
          actionsToSave.push({
            ...actionBase,
            actionType: ACTION_TYPES.CREATE,
          });
          break;
      }
      break;
    case METHODS.PATCH:
      switch (true) {
        case paths.patchMessage.test(url):
          actionsToSave.push({
            ...actionBase,
            actionType: ACTION_TYPES.UPDATE,
          });
          break;
      }
      break;
    case METHODS.DELETE:
      switch (true) {
        case paths.deleteMessage.test(url):
          actionsToSave.push({
            ...actionBase,
            actionType: ACTION_TYPES.DELETE,
          });
          break;
      }
      break;
    default:
      log.debug('chat-action: request does not match any allowed routes.');
      break;
  }
  return actionsToSave;
};
