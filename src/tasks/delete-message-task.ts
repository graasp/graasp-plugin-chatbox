import { FastifyLoggerInstance } from 'fastify';
import {
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemService,
  Member,
} from 'graasp';
import { ChatService } from '../db-service';
import { ChatMessage } from '../interfaces/chat-message';
import { BaseChatTask } from './base-chat-task';

type InputType = {
  item?: Item;
  chatId?: string;
  messageId?: string;
};

/**
 * Task to publish a message on a given chat
 */
export class DeleteMessageTask extends BaseChatTask<ChatMessage> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return DeleteMessageTask.name;
  }

  constructor(
    member: Member,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
    input: InputType,
  ) {
    super(member, itemService, itemMembershipService, chatService);
    this.input = input;
  }

  async run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void> {
    this.status = 'RUNNING';

    const { chatId, messageId } = this.input;

    this.targetId = messageId;

    // delete message
    const res = await this.chatService.deleteMessage(chatId, messageId, handler);
    await this.postHookHandler?.(res, this.actor, { log, handler });

    // return chat message
    this._result = res;
    this.status = 'OK';
  }
}
