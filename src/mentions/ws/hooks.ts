import { AccessDenied, NotFound, WebSocketService } from 'graasp-websockets';
import {
  Actor,
  DatabaseTransactionHandler,
  ItemMembershipService,
  MemberService,
  TaskRunner,
} from 'graasp';
import { ChatMentionsTaskManager } from '../interfaces/chat-mentions-task-manager';
import { chatMentionTopic } from './events';

export function registerChatMentionsWsHooks(
  websockets: WebSocketService,
  runner: TaskRunner<Actor>,
  memberService: MemberService,
  itemMembershipService: ItemMembershipService,
  chatTaskManager: ChatMentionsTaskManager,
  validationDbHandler: DatabaseTransactionHandler,
) {
  websockets.register(chatMentionTopic, async (req) => {
    const { channel: memberId, member, reject } = req;
    // member must exist
    const memberFromDb = await memberService.get(memberId, validationDbHandler);
    if (!memberFromDb) {
      reject(NotFound());
    }
    // member must request his own channel
    if (memberId !== member.id) {
      reject(AccessDenied());
    }
  });
  //
  // // on new chat message published, broadcast to item chat channel
  // const publishMessageTaskName = chatTaskManager.getPublishMessageTaskName();
  // runner.setTaskPostHookHandler<ChatMessage>(
  //   publishMessageTaskName,
  //   (message) => {
  //     websockets.publish(
  //       itemChatTopic,
  //       message.chatId,
  //       ItemChatEvent('publish', message),
  //     );
  //   },
  // );
  //
  // // on update chat item, broadcast to item chat channel
  // const patchMessageTaskName = chatTaskManager.getPatchMessageTaskName();
  // runner.setTaskPostHookHandler<ChatMessage>(
  //   patchMessageTaskName,
  //   (message) => {
  //     websockets.publish(
  //       itemChatTopic,
  //       message.chatId,
  //       ItemChatEvent('update', message),
  //     );
  //   },
  // );
  //
  // // on delete chat item, broadcast to item chat channel
  // const deleteMessageTaskName = chatTaskManager.getDeleteMessageTaskName();
  // runner.setTaskPostHookHandler<ChatMessage>(
  //   deleteMessageTaskName,
  //   (message) => {
  //     websockets.publish(
  //       itemChatTopic,
  //       message.chatId,
  //       ItemChatEvent('delete', message),
  //     );
  //   },
  // );
  //
  // // on clear chat, broadcast to item chat channel
  // const clearChatTaskName = chatTaskManager.getClearChatTaskName();
  // runner.setTaskPostHookHandler<Chat>(clearChatTaskName, (chat) => {
  //   websockets.publish(itemChatTopic, chat.id, ItemChatEvent('clear'));
  // });
}
