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
    console.log('Member id:', member.id);
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';
    console.log('Hello i am getting your mentions');
    // get all mentions
    const mentions = await this.mentionService.getAll(this.targetId, handler);
    console.log(mentions);
    this._result = mentions;
    this.status = 'OK';
  }
}
