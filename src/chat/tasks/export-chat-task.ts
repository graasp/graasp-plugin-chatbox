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
 * Task to export a chat from the database
 */
export class ExportChatTask extends BaseChatTask<Chat> {
  get name(): string {
    return ExportChatTask.name;
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

    // get chat with member names
    const messages = await this.chatService.export(this.targetId, handler);
    // return chat
    this._result = {
      id: this.targetId,
      messages,
    };
    this.status = TaskStatus.OK;
  }
}
