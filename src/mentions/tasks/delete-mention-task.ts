import { FastifyLoggerInstance } from 'fastify';

import { DatabaseTransactionHandler, Member, TaskStatus } from '@graasp/sdk';

import { MentionService } from '../db-service';
import { ChatMention } from '../interfaces/chat-mention';
import { BaseMentionTask } from './base-mention-task';

/**
 * Task to delete a mention from the database
 */
export class DeleteMentionTask extends BaseMentionTask<ChatMention> {
  get name(): string {
    return DeleteMentionTask.name;
  }

  constructor(
    member: Member,
    mentionId: string,
    mentionService: MentionService,
  ) {
    super(member, mentionService);
    this.targetId = mentionId;
  }

  async run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void> {
    this.status = TaskStatus.RUNNING;

    // delete mention
    const chatMention = await this.mentionService.deleteMention(
      this.targetId,
      handler,
    );
    await this.postHookHandler?.(chatMention, this.actor, { log, handler });

    this._result = chatMention;
    this.status = TaskStatus.OK;
  }
}
