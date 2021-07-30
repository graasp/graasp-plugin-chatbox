import { FastifyLoggerInstance } from 'fastify';
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

/**
 * Task to publish a message on a given chat
 */
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

  async run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void> {
    this.status = 'RUNNING';

    // get item for which we're fetching the chat
    const item = await this.itemService.get(this.targetId, handler);
    if (!item) {
      throw new ItemNotFound(this.targetId);
    }

    // verify if member has access to this chat
    const hasRights = await this.itemMembershipService.canRead(
      this.actor.id,
      item,
      handler,
    );
    if (!hasRights) {
      throw new MemberCannotReadItem(this.targetId);
    }

    // set chatId and author
    this.data.chatId = item.id;
    this.data.creator = this.actor.id;

    // publish message
    await this.preHookHandler?.(this.data, this.actor, { log, handler });
    const res = await this.chatService.publishMessage(this.data, handler);
    await this.postHookHandler?.(res, this.actor, { log, handler });

    // return chat message
    this._result = res;
    this.status = 'OK';
  }
}
