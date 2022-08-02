import { FastifyLoggerInstance } from 'fastify';

import {
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemService,
  Member,
  TaskStatus,
} from '@graasp/sdk';

import { ChatMessageNotFound } from '../../util/graasp-item-chat-error';
import { ChatService } from '../db-service';
import { ChatMessage } from '../interfaces/chat-message';
import { BaseChatTask } from './base-chat-task';

type InputType = {
  item?: Item;
  chatId?: string;
  messageId?: string;
  message?: string;
};

/**
 * Task to publish a message on a given chat
 */
export class PatchMessageTask extends BaseChatTask<ChatMessage> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return PatchMessageTask.name;
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

    const { messageId, message, item } = this.input;

    this.targetId = messageId;

    // set chatMessage fields
    const chatMessage: Partial<ChatMessage> = {
      id: messageId,
      chatId: item.id,
      body: message,
    };

    // patch message
    const res = await this.chatService.patchMessage(chatMessage, handler);
    // action returns no entries which means the message was not found
    // do not run the post hook
    if (res) {
      await this.postHookHandler?.(res, this.actor, {
        log,
        handler,
      });
    } else {
      throw new ChatMessageNotFound(messageId);
    }

    // return chat message
    this._result = res;
    this.status = TaskStatus.OK;
  }
}
