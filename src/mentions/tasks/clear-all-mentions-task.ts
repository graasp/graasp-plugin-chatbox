import { Actor, DatabaseTransactionHandler, ItemService } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';

/**
 * Task to clear all mentions of a member from the database
 */
export class ClearAllMentionsTask extends BaseMentionTask<ChatMention[]> {
  get name(): string {
    return ClearAllMentionsTask.name;
  }

  constructor(
    member: Actor,
    itemService: ItemService,
    mentionService: MentionService,
  ) {
    super(member, itemService, mentionService);
    this.targetId = member.id;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // clear all mentions
    this._result = await this.mentionService.clearAllMentions(
      this.targetId,
      handler,
    );
    this.status = 'OK';
  }
}
