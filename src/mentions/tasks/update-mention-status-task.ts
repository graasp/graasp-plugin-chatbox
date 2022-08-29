import { FastifyLoggerInstance } from 'fastify';

import {
  Actor,
  DatabaseTransactionHandler,
  MentionStatus,
  TaskStatus,
} from '@graasp/sdk';

import { MentionService } from '../db-service';
import { ChatMention } from '../interfaces/chat-mention';
import { BaseMentionTask } from './base-mention-task';

type InputType = {
  status?: MentionStatus;
  mention?: ChatMention;
};

/**
 * Task to update a mention's status in the database
 */
export class UpdateMentionStatusTask extends BaseMentionTask<ChatMention> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return UpdateMentionStatusTask.name;
  }

  constructor(
    member: Actor,
    mentionId: string,
    mentionService: MentionService,
    input: InputType,
  ) {
    super(member, mentionService);
    this.targetId = mentionId;
    this.input = input;
  }

  async run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void> {
    this.status = TaskStatus.RUNNING;

    const { mention, status } = this.input;

    // patch mention
    const updatedMention = await this.mentionService.patchMention(
      this.targetId,
      status,
      handler,
    );

    // add the 'message' key (without needing a join since it is not modified when changing the mention status)
    const updatedMentionWithMessage = {
      // contains the message string from the join with 'chat_message' table
      ...mention,
      // has updated values of 'chat_mention' table but without the 'message' key
      ...updatedMention,
    };
    await this.postHookHandler?.(updatedMentionWithMessage, this.actor, {
      log,
      handler,
    });
    this._result = updatedMentionWithMessage;
    this.status = TaskStatus.OK;
  }
}
