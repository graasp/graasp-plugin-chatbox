import { Actor, DatabaseTransactionHandler } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';
import { MemberCannotEditMention } from '../../util/graasp-item-chat-error';
import { FastifyLoggerInstance } from 'fastify';

type InputType = {
  status?: string;
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
    this.status = 'RUNNING';

    const mention = await this.mentionService.getMention(
      this.targetId,
      handler,
    );

    // member can only update his own notifications
    if (this.actor.id !== mention.memberId) {
      throw new MemberCannotEditMention();
    }

    const { status } = this.input;
    // patch mention
    const updatedMention = await this.mentionService.patchMention(
      this.targetId,
      status,
      handler,
    );
    await this.postHookHandler?.(updatedMention, this.actor, { log, handler });
    this._result = updatedMention;
    this.status = 'OK';
  }
}
