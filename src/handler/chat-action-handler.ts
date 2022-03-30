import { ActionHandlerInput, BaseAction } from 'graasp-plugin-actions';
import geoip from 'geoip-lite';
import { ACTION_TYPES, CLIENT_HOSTS, ITEM_TYPES, METHODS, paths, VIEW_UNKNOWN_NAME } from '../constants/constants';
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
  const {request, log } = actionInput;
  // function called each time there is a request in the items in graasp (onResponse hook in graasp)
  // identify and check the correct endpoint of the request
  // check that the request is ok
  const { headers, member, method, url, ip, params } = request;

  // warning: this is really dependent on the url -> how to be more safe and dynamic?
  const itemId: string = (params as { itemId: string })?.itemId;

  const geolocation = geoip.lookup(ip);

  const view = CLIENT_HOSTS.find(({ hostname: thisHN }) => headers?.origin?.includes(thisHN))?.name ?? VIEW_UNKNOWN_NAME;

  const chatData = JSON.parse(payload);

  const actionsToSave = [];
  const actionBase = {
    memberId: member.id,
    memberType: member.type,
    // todo: handle the case when get send multiple messages
    extra: { memberId: member.id, itemId, message: chatData },
    view,
    itemId,
    itemType: ITEM_TYPES.CHAT,
    geolocation,
  };

  // identify the endpoint with method and url
  // call createActionTask or createActionTaskMultipleItems to save the corresponding action
  switch (method) {
    // todo: make an action on GET chat ??
    case METHODS.POST:
      switch (true) {
        case paths.postMessage.test(url):
          // const copyItemParentId = (reply. as { body: string })?.body;
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
      log.debug('action: request does not match any allowed routes.');
      break;
  }
  return actionsToSave;
};
