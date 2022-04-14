import { FastifyLoggerInstance } from 'fastify';
import {
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemService,
  Member,
} from 'graasp';
import { ChatService } from '../db-service';
import { ChatMessage } from '../interfaces/chat-message';
import { BaseChatTask } from './base-chat-task';
import { MemberCanNotDeleteChat } from '../util/graasp-item-chat-error';

type InputType = {
  item?: Item;
  chatId?: string;
};

/**
 * Task to delete a complete chat
 */
export class DeleteChatTask extends BaseChatTask<ChatMessage[]> {
  input?: InputType;
  getInput?: () => InputType;
  member?: Member;

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
    this.member = member;
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
    // user does not have sufficient rights
    if (!canAdmin) {
      throw new MemberCanNotDeleteChat(chatId);
    }
    // delete message
    const res = await this.chatService.deleteChat(chatId, handler);
    await this.postHookHandler?.(chatId, this.actor, { log, handler });

    // return chat message
    this._result = res;
    this.status = 'OK';
  }
}
