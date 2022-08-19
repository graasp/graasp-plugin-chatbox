import { FastifyLoggerInstance } from 'fastify';

import {
  DatabaseTransactionHandler,
  Item,
  Member,
  PostHookHandlerType,
  TaskStatus,
} from '@graasp/sdk';

import { MentionService } from '../db-service';
import { ChatMention } from '../interfaces/chat-mention';
import { BaseMentionTask } from './base-mention-task';

type InputType = {
  item?: Item;
  messageId?: string;
  message?: string;
  mentionedUsers?: Member[];
};

/**
 * Task to publish a message on a given chat
 */
export class CreateMentionsTask extends BaseMentionTask<ChatMention[]> {
  input?: InputType;
  getInput?: () => InputType;

  // adapt types of post-hook for this special use case
  postHookHandler: PostHookHandlerType<
    ChatMention[],
    { mentionedUsers: Member[]; item: Item }
  >;

  get name(): string {
    return CreateMentionsTask.name;
  }

  constructor(
    member: Member,
    mentionService: MentionService,
    input: InputType,
  ) {
    super(member, mentionService);
    this.input = input;
  }

  async run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void> {
    this.status = TaskStatus.RUNNING;

    const { messageId, item, message, mentionedUsers } = this.input;

    this.targetId = messageId;

    // create only the mentions where the user exists
    const mentionedUserIds = mentionedUsers.map((m) => m.id);

    // create mentions
    const newChatMentions = await this.mentionService.createMentions(
      mentionedUserIds,
      item.path,
      messageId,
      this.actor.id,
      handler,
    );
    const newChatMentionsWithMessage = newChatMentions.map((cm) => ({
      ...cm,
      message,
    }));
    await this.postHookHandler?.(
      newChatMentionsWithMessage,
      this.actor,
      {
        log,
        handler,
      },
      {
        mentionedUsers,
        item,
      },
    );

    // return chat message
    this._result = newChatMentionsWithMessage;
    this.status = TaskStatus.OK;
  }
}
