import { Actor, DatabaseTransactionHandler, ItemService } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';

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
    itemService: ItemService,
    mentionService: MentionService,
  ) {
    super(member, itemService, mentionService);
    this.targetId = mentionId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // delete mentions
    this._result = await this.mentionService.deleteMention(
      this.targetId,
      handler,
    );
    this.status = 'OK';
  }
}
