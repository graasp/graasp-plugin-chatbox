import { FastifyLoggerInstance } from 'fastify';
import {
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemService,
  Member,
} from 'graasp';
import { ChatService } from '../db-service';
import { BaseChatTask } from './base-chat-task';
import { MemberCanNotDeleteChat } from '../util/graasp-item-chat-error';
import { Chat } from '../interfaces/chat';

type InputType = {
  item?: Item;
  chatId?: string;
};

/**
 * Task to delete a complete chat
 */
export class DeleteChatTask extends BaseChatTask<Chat> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return DeleteChatTask.name;
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

    const { chatId, item } = this.input;

    this.targetId = chatId;

    const canAdmin = await this.itemMembershipService.canAdmin(
      this.actor.id,
      item,
      handler,
    );
    console.log('Can Admin', canAdmin, this.actor.id);
    // user does not have sufficient rights
    if (!canAdmin) {
      throw new MemberCanNotDeleteChat(chatId);
    }
    // delete message
    const messages = await this.chatService.deleteChat(chatId, handler);
    await this.postHookHandler?.(chatId, this.actor, { log, handler });
    const chat: Chat = { id: this.targetId, messages };
    console.log('chat', chat);
    // return chat message
    this._result = chat;
    this.status = 'OK';
  }
}
