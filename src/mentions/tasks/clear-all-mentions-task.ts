import { Actor, DatabaseTransactionHandler } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { MemberChatMentions } from '../interfaces/chat-mention';
import { FastifyLoggerInstance } from 'fastify';

/**
 * Task to clear all mentions of a member from the database
 */
export class ClearAllMentionsTask extends BaseMentionTask<MemberChatMentions> {
  get name(): string {
    return ClearAllMentionsTask.name;
  }

  constructor(member: Actor, mentionService: MentionService) {
    super(member, mentionService);
    this.targetId = member.id;
  }

  async run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void> {
    this.status = 'RUNNING';

    // clear all mentions
    const chatMentions = await this.mentionService.clearAllMentions(
      this.targetId,
      handler,
    );
    const memberMentions = {
      memberId: this.targetId,
      mentions: chatMentions,
    };
    await this.postHookHandler?.(memberMentions, this.actor, { log, handler });

    this._result = memberMentions;
    this.status = 'OK';
  }
}
