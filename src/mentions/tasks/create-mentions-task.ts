import { FastifyLoggerInstance } from 'fastify';

import {
  DatabaseTransactionHandler,
  Item,
  Member,
  TaskStatus,
} from '@graasp/sdk';

import { MentionService } from '../db-service';
import { ChatMention } from '../interfaces/chat-mention';
import { BaseMentionTask } from './base-mention-task';

type InputType = {
  item?: Item;
  messageId?: string;
  mentions?: string[];
  message?: string;
};

/**
 * Task to publish a message on a given chat
 */
export class CreateMentionsTask extends BaseMentionTask<ChatMention[]> {
  input?: InputType;
  getInput?: () => InputType;

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

    const { messageId, mentions, item, message } = this.input;

    this.targetId = messageId;

    // create mentions
    const newChatMentions = await this.mentionService.createMentions(
      mentions,
      item.path,
      messageId,
      this.actor.id,
      handler,
    );
    const newChatMentionsWithMessage = newChatMentions.map((cm) => ({
      ...cm,
      message,
    }));
    await this.postHookHandler?.(newChatMentionsWithMessage, this.actor, {
      log,
      handler,
    });

    // return chat message
    this._result = newChatMentionsWithMessage;
    this.status = TaskStatus.OK;
  }
}
