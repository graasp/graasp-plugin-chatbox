import { Actor, DatabaseTransactionHandler } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';
import { MemberCannotEditMention } from '../../util/graasp-item-chat-error';

/**
 * Task to check if the actor is requesting his own mentions
 */
export class IsOwnMentionTask extends BaseMentionTask<ChatMention> {
  get name(): string {
    return IsOwnMentionTask.name;
  }

  constructor(
    member: Actor,
    mentionId: string,
    mentionService: MentionService,
  ) {
    super(member, mentionService);
    this.targetId = mentionId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    this._result = await this.mentionService.getMention(this.targetId, handler);

    // member can only update his own notifications
    if (this.actor.id !== this._result.memberId) {
      throw new MemberCannotEditMention();
    }

    this.status = 'OK';
  }
}
