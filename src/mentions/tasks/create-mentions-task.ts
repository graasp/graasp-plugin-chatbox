import { FastifyLoggerInstance } from 'fastify';
import { DatabaseTransactionHandler, Item, Member } from 'graasp';
import { BaseMentionTask } from './base-mention-task';
import { ChatMention } from '../interfaces/chat-mention';
import { MentionService } from '../db-service';

type InputType = {
  item?: Item;
  messageId?: string;
  mentions?: string[];
};

/**
 * Task to publish a message on a given chat
 */
export class CreateMentionsTask extends BaseMentionTask<ChatMention[]> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return CreateMentionsTask.name;
  }

  constructor(
    member: Member,
    mentionService: MentionService,
    input: InputType,
  ) {
    super(member, mentionService);
    this.input = input;
  }

  async run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void> {
    this.status = 'RUNNING';

    const { messageId, mentions, item } = this.input;

    this.targetId = messageId;

    // create mentions
    const newChatMentions = await this.mentionService.createMentions(
      mentions,
      item.path,
      messageId,
      this.actor.id,
      handler,
    );
    await this.postHookHandler?.(newChatMentions, this.actor, { log, handler });

    // return chat message
    this._result = newChatMentions;
    this.status = 'OK';
  }
}
