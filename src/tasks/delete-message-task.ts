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
import {
  ChatMessageNotFound,
  MemberCanNotDeleteMessage,
} from '../util/graasp-item-chat-error';

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
    this.status = 'RUNNING';

    const { chatId, messageId } = this.input;

    this.targetId = messageId;

    const { creator } = await this.chatService.getMessage(messageId, handler);

    // check that member requesting the deletion is the owner of the message
    if (this.actor.id !== creator) {
      throw new MemberCanNotDeleteMessage(messageId);
    }

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
    this.status = 'OK';
  }
}
