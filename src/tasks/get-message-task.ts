import {
  Actor,
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemService,
} from 'graasp';
import { ChatService } from '../db-service';
import { BaseChatTask } from './base-chat-task';
import { ChatMessage } from '../interfaces/chat-message';
import { ChatMessageNotFound } from '../util/graasp-item-chat-error';

type InputType = {
  item?: Item;
  messageId?: string;
};

/**
 * Task to retrieve a message from the database
 */
export class GetMessageTask extends BaseChatTask<ChatMessage> {
  input?: InputType;
  getInput?: () => InputType;

  get name(): string {
    return GetMessageTask.name;
  }

  constructor(
    member: Actor,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
    input: InputType,
  ) {
    super(member, itemService, itemMembershipService, chatService);
    this.input = input;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    const { item, messageId } = this.input;

    this.targetId = item.id;

    // get chat
    const message = await this.chatService.getMessage(messageId, handler);
    if (!message) {
      throw new ChatMessageNotFound(messageId);
    }
    console.log(message);
    // return chat
    this._result = message;
    this.status = 'OK';
  }
}
