import { AccessDenied, NotFound, WebSocketService } from 'graasp-websockets';
import {
  Actor,
  DatabaseTransactionHandler,
  ItemMembershipService,
  MemberService,
  TaskRunner,
} from 'graasp';
import { ChatMentionsTaskManager } from '../interfaces/chat-mentions-task-manager';
import { chatMentionTopic, MentionEvent } from './events';
import { ChatMention, MemberChatMentions } from '../interfaces/chat-mention';

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

  // on new chat message published, broadcast the mentions to their channels
  const createMentionsTaskName = chatTaskManager.getCreateMentionsTaskName();
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
    chatTaskManager.getUpdateMentionStatusTaskName();
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
  const deleteMentionTaskName = chatTaskManager.getDeleteMentionTaskName();
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
    chatTaskManager.getClearAllMentionsTaskName();
  runner.setTaskPostHookHandler<MemberChatMentions>(
    clearAllMentionsTaskName,
    ({ memberId }) => {
      websockets.publish(chatMentionTopic, memberId, MentionEvent('clear'));
    },
  );
}
