import { Actor, DatabaseTransactionHandler } from 'graasp';
import { MentionService } from '../db-service';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';
import { FastifyLoggerInstance } from 'fastify';

type InputType = {
  status?: string;
  mention?: ChatMention;
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

    const { mention } = this.input;

    const { status } = this.input;
    // patch mention
    const updatedMention = await this.mentionService.patchMention(
      this.targetId,
      status,
      handler,
    );
    const updatedMentionWithMessage = {
      ...mention,
      ...updatedMention,
    };
    await this.postHookHandler?.(updatedMentionWithMessage, this.actor, {
      log,
      handler,
    });
    this._result = updatedMentionWithMessage;
    this.status = 'OK';
  }
}
