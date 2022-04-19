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
  chatMessage?: Partial<ChatMessage>;
};

/**
 * Task to publish a message on a given chat
 */
export class PublishMessageTask extends BaseChatTask<ChatMessage> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return PublishMessageTask.name;
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

    const { chatId, chatMessage, item } = this.input;

    this.targetId = chatId;

    // set chatId and author
    chatMessage.chatId = item.id;
    chatMessage.creator = this.actor.id;

    // publish message
    await this.preHookHandler?.(chatMessage, this.actor, { log, handler });
    const res = await this.chatService.publishMessage(chatMessage, handler);
    const newChatMessage = {
      ...res,
      // replace updatedAt from null value to empty string
      ...(res?.updatedAt ? null : { updatedAt: '' }),
    };
    await this.postHookHandler?.(newChatMessage, this.actor, { log, handler });

    // return chat message
    this._result = newChatMessage;
    this.status = 'OK';
  }
}
