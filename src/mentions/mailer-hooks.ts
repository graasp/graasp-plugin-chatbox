import { FastifyInstance, FastifyLoggerInstance } from 'fastify';

import {
  Actor,
  Context,
  Hostname,
  Item,
  Member,
  TaskRunner,
  buildItemLinkForBuilder,
} from '@graasp/sdk';

import { ChatMention } from './interfaces/chat-mention';
import { ChatMentionsTaskManager } from './interfaces/chat-mentions-task-manager';

export function registerChatMentionsMailerHooks(
  runner: TaskRunner<Actor>,
  chatMentionsTaskManager: ChatMentionsTaskManager,
  mailer: FastifyInstance['mailer'],
  hosts?: Hostname[],
) {
  const host = hosts.find((h) => h.name === Context.BUILDER)?.hostname;

  const sendMentionNotificationEmail = ({
    item,
    member,
    log,
  }: {
    item: Item;
    member: Member;
    log: FastifyLoggerInstance;
  }) => {
    const itemLink = buildItemLinkForBuilder({
      host,
      itemId: item.id,
      chatOpen: true,
    });
    const lang = member?.extra?.lang as string;

    mailer
      .sendChatMentionNotificationEmail(
        member,
        itemLink,
        item.name,
        member.name,
        lang,
      )
      .catch((err) => {
        log.warn(err, `mailer failed. notification link: ${itemLink}`);
      });
  };

  // on new mentions created, send email to mentioned users
  const createMentionsTaskName =
    chatMentionsTaskManager.getCreateMentionsTaskName();
  runner.setTaskPostHookHandler<ChatMention[]>(
    createMentionsTaskName,
    (
      _,
      __,
      { log },
      { mentionedUsers, item }: { mentionedUsers: Member[]; item: Item },
    ) => {
      // send email to notify users
      mentionedUsers.forEach((mentionedUser) => {
        sendMentionNotificationEmail({
          item,
          member: mentionedUser,
          log,
        });
      });
    },
  );
}
