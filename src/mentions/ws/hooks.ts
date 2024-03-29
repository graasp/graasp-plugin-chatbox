import {
  Actor,
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemTaskManager,
  MemberService,
  TaskRunner,
  Websocket,
  WebsocketService,
} from '@graasp/sdk';

import { ChatMessage } from '../../chat/interfaces/chat-message';
import { ChatTaskManager } from '../../chat/interfaces/chat-task-manager';
import { MentionService } from '../db-service';
import { ChatMention, MemberChatMentions } from '../interfaces/chat-mention';
import { ChatMentionsTaskManager } from '../interfaces/chat-mentions-task-manager';
import { MentionEvent, chatMentionTopic } from './events';

export function registerChatMentionsWsHooks(
  websockets: WebsocketService,
  runner: TaskRunner<Actor>,
  mentionService: MentionService,
  memberService: MemberService,
  itemMembershipService: ItemMembershipService,
  itemTaskManager: ItemTaskManager,
  chatTaskManager: ChatTaskManager,
  chatMentionsTaskManager: ChatMentionsTaskManager,
  validationDbHandler: DatabaseTransactionHandler,
) {
  websockets.register(chatMentionTopic, async (req) => {
    const { channel: memberId, member, reject } = req;
    // member must exist
    const memberFromDb = await memberService.get(memberId, validationDbHandler);
    if (!memberFromDb) {
      reject(new Websocket.NotFoundError());
    }
    // member must request his own channel
    if (memberId !== member.id) {
      reject(new Websocket.AccessDeniedError());
    }
  });

  // on new chat message published, broadcast the mentions to their channels
  const createMentionsTaskName =
    chatMentionsTaskManager.getCreateMentionsTaskName();
  runner.setTaskPostHookHandler<ChatMention[]>(
    createMentionsTaskName,
    (mentions) => {
      // publish each mentions to its respective channel
      mentions.map((mention) =>
        websockets.publish(
          chatMentionTopic,
          mention.memberId,
          MentionEvent('publish', mention),
        ),
      );
    },
  );

  // on update mention, broadcast to member mention channel
  const updateMentionStatusTaskName =
    chatMentionsTaskManager.getUpdateMentionStatusTaskName();
  runner.setTaskPostHookHandler<ChatMention>(
    updateMentionStatusTaskName,
    (mention) => {
      websockets.publish(
        chatMentionTopic,
        mention.memberId,
        MentionEvent('update', mention),
      );
    },
  );

  // on delete chat mention, broadcast to member mention channel
  const deleteMentionTaskName =
    chatMentionsTaskManager.getDeleteMentionTaskName();
  runner.setTaskPostHookHandler<ChatMention>(
    deleteMentionTaskName,
    (mention) => {
      websockets.publish(
        chatMentionTopic,
        mention.memberId,
        MentionEvent('delete', mention),
      );
    },
  );

  // on clear chat, broadcast to item chat channel
  const clearAllMentionsTaskName =
    chatMentionsTaskManager.getClearAllMentionsTaskName();
  runner.setTaskPostHookHandler<MemberChatMentions>(
    clearAllMentionsTaskName,
    ({ memberId }) => {
      websockets.publish(chatMentionTopic, memberId, MentionEvent('clear'));
    },
  );

  // on item delete -> pre-hook should remove the mentions from the channel
  const deleteItemTaskName = itemTaskManager.getDeleteTaskName();
  runner.setTaskPreHookHandler<Item>(
    deleteItemTaskName,
    async (item, actor, { handler }) => {
      // get mentions to be deleted
      if (item.path) {
        const mentions = await mentionService.getMentionsByItemPath(
          item.path,
          handler,
        );
        mentions.map((m) =>
          websockets.publish(
            chatMentionTopic,
            m.memberId,
            MentionEvent('delete', m),
          ),
        );
      }
    },
  );

  // on message delete -> pre-hook should remove the mentions from the channel
  const deleteChatMessageTaskName = chatTaskManager.getDeleteMessageTaskName();
  runner.setTaskPreHookHandler<ChatMessage>(
    deleteChatMessageTaskName,
    async (message, actor, { handler }) => {
      const mentions = await mentionService.getMentionsByMessageId(
        message.id,
        handler,
      );
      mentions.map((m) =>
        websockets.publish(
          chatMentionTopic,
          m.memberId,
          MentionEvent('delete', m),
        ),
      );
    },
  );
}
