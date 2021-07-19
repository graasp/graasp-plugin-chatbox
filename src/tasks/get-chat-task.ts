import {
  DatabaseTransactionHandler,
  ItemMembershipService,
  ItemService,
  Member,
} from 'graasp';
import { ChatService } from '../db-service';
import { Chat } from '../interfaces/chat';
import {
  ItemNotFound,
  MemberCannotReadItem,
} from '../util/graasp-item-chat-error';
import { BaseChatTask } from './base-chat-task';

export class GetChatTask extends BaseChatTask<Chat> {
  get name(): string {
    return GetChatTask.name;
  }

  constructor(
    member: Member,
    itemId: string,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
  ) {
    super(member, itemService, itemMembershipService, chatService);
    this.targetId = itemId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // get item for which we're fetching the chat
    const item = await this.itemService.get(this.targetId, handler);
    if (!item) throw new ItemNotFound(this.targetId);

    // verify if member has access to this chat
    const hasRights = await this.itemMembershipService.canRead(
      this.actor.id,
      item,
      handler,
    );
    if (!hasRights) throw new MemberCannotReadItem(this.targetId);

    // get chat
    const messages = await this.chatService.get(this.targetId, handler);
    const chat: Chat = { id: this.targetId, messages };

    // return chat
    this._result = chat;
    this.status = 'OK';
  }
}
