import { ActionHandlerInput, BaseAction } from 'graasp-plugin-actions';
import geoip from 'geoip-lite';
import { ACTION_TYPES, CLIENT_HOSTS, METHODS, paths, VIEW_UNKNOWN_NAME } from '../constants/constants';
import { Member } from 'graasp';

declare module 'fastify' {
  export interface FastifyRequest {
    member: Member;
  }
}

export const createChatActionHandler = async (
  actionInput: ActionHandlerInput,
): Promise<BaseAction[]> => {
  const {request, reply, log } = actionInput;
  console.log(request);
  console.log(reply);
  // function called each time there is a request in the items in graasp (onResponse hook in graasp)
  // identify and check the correct endpoint of the request
  // check that the request is ok
  const { headers, member, method, url, ip, params } = request;

  console.log(member);

  // warning: this is really dependent on the url -> how to be more safe and dynamic?
  const paramItemId: string = (params as { id: string })?.id;

  const geolocation = geoip.lookup(ip);

  const view = CLIENT_HOSTS.find(({ hostname: thisHN }) => headers?.origin?.includes(thisHN))?.name ?? VIEW_UNKNOWN_NAME;

  const actionsToSave = [];
  const actionBase = {
    memberId: member.id,
    memberType: member.type,
    extra: { memberId: member.id },
    view,
    geolocation,
  };

  // identify the endpoint with method and url
  // call createActionTask or createActionTaskMultipleItems to save the corresponding action
  switch (method) {
    // todo: make an action on get chat ??
    // case METHODS.GET:
    //   switch (true) {
    //     case paths.getChat.test(url):
    //       actionsToSave.push({
    //         ...actionBase,
    //         itemId: paramItemId,
    //         actionType: ACTION_TYPES.GET_CHILDREN,
    //         extra: { ...actionBase.extra, itemId: paramItemId },
    //       });
    //       break;
    //   }
    //   break;
    case METHODS.POST:
      switch (true) {
        case paths.postMessage.test(url):
          // const copyItemParentId = (reply. as { body: string })?.body;
          actionsToSave.push({
            ...actionBase,
            itemId: paramItemId,
            actionType: ACTION_TYPES.CREATE,
            extra: { ...actionBase.extra, itemId: paramItemId },
          });
          break;
      }
      break;
    case METHODS.PATCH:
      switch (true) {
        case paths.patchMessage.test(url):
          actionsToSave.push({
            ...actionBase,
            itemId: paramItemId,
            actionType: ACTION_TYPES.UPDATE,
            extra: { ...actionBase.extra, itemId: paramItemId },
          });
          break;
      }
      break;
    case METHODS.DELETE:
      switch (true) {
        case paths.deleteMessage.test(url):
          actionsToSave.push({
            ...actionBase,
            itemId: paramItemId,
            actionType: ACTION_TYPES.DELETE,
            extra: { ...actionBase.extra, itemId: paramItemId },
          });
          break;
      }
      break;
    default:
      log.debug('action: request does not match any allowed routes.');
      break;
  }
  console.log('Heeeeeeelllllllloooo');
  console.log(actionsToSave);
  return actionsToSave;
};
