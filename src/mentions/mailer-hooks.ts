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
    const emailFreq = member?.extra?.emailFreq as string;

    // do not send the email if the user has emailFreq set to "never"
    if (emailFreq === 'never') {
      log.warn(`email not sent because of user preference`);
      return;
    }

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
      // casting here because the runner assumes the passed argument is a simple actor
      // but with mentions the user is always logged in so it resolves to a Member
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
