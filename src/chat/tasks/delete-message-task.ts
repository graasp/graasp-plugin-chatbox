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
import { ChatMessageNotFound } from '../../util/graasp-item-chat-error';
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
    this.status = TaskStatus.RUNNING;

    const { chatId, messageId } = this.input;

    this.targetId = messageId;

    // delete message
    const res = await this.chatService.deleteMessage(
      chatId,
      messageId,
      handler,
    );
    // action returns no entries which means the message was not found
    // do not run the post hook
    if (res) {
      await this.postHookHandler?.(res, this.actor, { log, handler });
    } else {
      throw new ChatMessageNotFound(messageId);
    }

    // return chat message
    this._result = res;
    this.status = TaskStatus.OK;
  }
}
