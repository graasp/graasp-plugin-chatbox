import {
  DatabaseTransactionHandler,
  ItemMembershipService,
  ItemService,
  Member,
} from 'graasp';
import { ChatService } from '../db-service';
import { ChatMessage } from '../interfaces/chat-message';
import {
  ItemNotFound,
  MemberCannotReadItem,
} from '../util/graasp-item-chat-error';
import { BaseChatTask } from './base-chat-task';

export class PublishMessageTask extends BaseChatTask<ChatMessage> {
  get name(): string {
    return PublishMessageTask.name;
  }

  constructor(
    member: Member,
    chatId: string,
    data: Partial<ChatMessage>,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
  ) {
    super(member, itemService, itemMembershipService, chatService);
    this.targetId = chatId;
    this.data = data;
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

    // set author
    this.data.creator = this.actor.id;
    // publish message
    const res = await this.chatService.publishMessage(this.data, handler);

    // return chat message
    this._result = res;
    this.status = 'OK';
  }
}
