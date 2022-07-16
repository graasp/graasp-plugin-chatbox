import { Actor, DatabaseTransactionHandler } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';

/**
 * Task to retrieve all mentions of a member from the database
 */
export class GetMemberMentionsTask extends BaseMentionTask<ChatMention[]> {
  get name(): string {
    return GetMemberMentionsTask.name;
  }

  constructor(member: Actor, mentionService: MentionService) {
    super(member, mentionService);
    this.targetId = member.id;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // get all mentions
    this._result = await this.mentionService.getAll(this.targetId, handler);
    this.status = 'OK';
  }
}
