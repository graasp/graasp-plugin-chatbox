import { FastifyInstance, FastifyLoggerInstance } from 'fastify';

import {
  Context,
  Hostname,
  Item,
  Member,
  buildItemLinkForBuilder,
} from '@graasp/sdk';

import { ChatMention } from './interfaces/chat-mention';
import { ChatMentionsTaskManager } from './interfaces/chat-mentions-task-manager';

export function registerChatMentionsMailerHooks(
  fastify: FastifyInstance,
  chatMentionsTaskManager: ChatMentionsTaskManager,
  hosts?: Hostname[],
) {
  const { taskRunner: runner, mailer } = fastify;
  const host = hosts.find((h) => h.name === Context.BUILDER)?.hostname;

  const sendMentionNotificationEmail = ({
    item,
    member,
    mentionCreator,
    log,
  }: {
    item: Item;
    member: Member;
    mentionCreator: Member;
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
        mentionCreator.name,
        lang,
      )
      .catch((err) => {
        log.warn(err, `mailer failed. notification link: ${itemLink}`);
        console.log(member, 'mentioned by', mentionCreator);
      });
  };

  // on new mentions created, send email to mentioned users
  const createMentionsTaskName =
    chatMentionsTaskManager.getCreateMentionsTaskName();
  runner.setTaskPostHookHandler<ChatMention[]>(
    createMentionsTaskName,
    (
      _,
      mentionCreator,
      { log },
      { mentionedUsers, item }: { mentionedUsers: Member[]; item: Item },
    ) => {
      const creator = mentionCreator as Member;
      // send email to notify users
      mentionedUsers.forEach((mentionedUser) => {
        sendMentionNotificationEmail({
          item,
          member: mentionedUser,
          mentionCreator: creator,
          log,
        });
      });
    },
  );
}
