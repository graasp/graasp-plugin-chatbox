import { FastifyLoggerInstance } from 'fastify';

import {
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemService,
  Member,
  TaskStatus,
} from '@graasp/sdk';

import { ChatService } from '../db-service';
import { ChatMessage } from '../interfaces/chat-message';
import { BaseChatTask } from './base-chat-task';

type InputType = {
  item?: Item;
  chatId?: string;
  message?: string;
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
    this.status = TaskStatus.RUNNING;

    const { chatId, message, item } = this.input;

    this.targetId = chatId;

    // set chatId and author
    const chatMessage: Partial<ChatMessage> = {
      chatId: item.id,
      creator: this.actor.id,
      body: message,
    };

    // publish message
    await this.preHookHandler?.(chatMessage, this.actor, { log, handler });
    const newChatMessage = await this.chatService.publishMessage(
      chatMessage,
      handler,
    );
    await this.postHookHandler?.(newChatMessage, this.actor, { log, handler });

    // return chat message
    this._result = newChatMessage;
    this.status = TaskStatus.OK;
  }
}
