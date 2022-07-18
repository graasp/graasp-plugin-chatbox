import { Actor, DatabaseTransactionHandler } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';
import { FastifyLoggerInstance } from 'fastify';

/**
 * Task to delete a mention from the database
 */
export class DeleteMentionTask extends BaseMentionTask<ChatMention> {
  get name(): string {
    return DeleteMentionTask.name;
  }

  constructor(
    member: Actor,
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
    this.status = 'RUNNING';

    // delete mention
    const chatMention = await this.mentionService.deleteMention(
      this.targetId,
      handler,
    );
    await this.postHookHandler?.(chatMention, this.actor, { log, handler });

    this._result = chatMention;
    this.status = 'OK';
  }
}
