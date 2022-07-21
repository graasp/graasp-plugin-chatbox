import {
  Actor,
  DatabaseTransactionHandler,
  ItemMembershipService,
  ItemService,
  TaskStatus,
} from '@graasp/sdk';

import { ChatService } from '../db-service';
import { Chat } from '../interfaces/chat';
import { BaseChatTask } from './base-chat-task';

/**
 * Task to retrieve a chat from the database
 */
export class GetChatTask extends BaseChatTask<Chat> {
  get name(): string {
    return GetChatTask.name;
  }

  constructor(
    member: Actor,
    itemId: string,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
  ) {
    super(member, itemService, itemMembershipService, chatService);
    this.targetId = itemId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = TaskStatus.RUNNING;

    // get chat
    const messages = await this.chatService.get(this.targetId, handler);
    const chat: Chat = { id: this.targetId, messages };

    // return chat
    this._result = chat;
    this.status = TaskStatus.OK;
  }
}
