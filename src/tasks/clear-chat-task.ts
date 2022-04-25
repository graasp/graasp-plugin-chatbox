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
import { Chat } from '../interfaces/chat';

type InputType = {
  item?: Item;
  chatId?: string;
};

/**
 * Task to clear a complete chat
 */
export class ClearChatTask extends BaseChatTask<Chat> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return ClearChatTask.name;
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

    const { chatId } = this.input;

    this.targetId = chatId;

    // const canAdmin = await this.itemMembershipService.canAdmin(
    //   this.actor.id,
    //   item,
    //   handler,
    // );
    // // user does not have sufficient rights
    // if (!canAdmin) {
    //   throw new MemberCanNotClearChat(chatId);
    // }
    // delete message
    await this.chatService.clearChat(chatId, handler);
    const clearedChat: Chat = { id: this.targetId, messages: [] };
    await this.postHookHandler?.(clearedChat, this.actor, { log, handler });

    // return chat message
    this._result = clearedChat;
    this.status = 'OK';
  }
}
