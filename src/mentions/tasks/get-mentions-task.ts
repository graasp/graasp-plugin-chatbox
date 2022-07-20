import { Actor, DatabaseTransactionHandler } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { MemberChatMentions } from '../interfaces/chat-mention';
import { FastifyLoggerInstance } from 'fastify';

/**
 * Task to retrieve all mentions of a member from the database
 */
export class GetMemberMentionsTask extends BaseMentionTask<MemberChatMentions> {
  get name(): string {
    return GetMemberMentionsTask.name;
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

    // get all mentions
    const mentions = await this.mentionService.getAll(this.targetId, handler);
    const memberMentions = {
      memberId: this.targetId,
      mentions,
    };
    await this.postHookHandler?.(memberMentions, this.actor, { log, handler });

    this._result = memberMentions;
    this.status = 'OK';
  }
}
