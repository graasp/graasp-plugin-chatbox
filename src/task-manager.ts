import {
  Actor,
  ItemMembershipService,
  ItemService,
  Member,
  Task,
} from 'graasp';
import { ChatService } from './db-service';
import { Chat } from './interfaces/chat';
import { ChatMessage } from './interfaces/chat-message';
import { ChatTaskManager } from './interfaces/chat-task-manager';
import { GetChatTask } from './tasks/get-chat-task';
import { PublishMessageTask } from './tasks/publish-message-task';

export class TaskManager implements ChatTaskManager {
  private itemService: ItemService;
  private itemMembershipService: ItemMembershipService;
  private chatService: ChatService;

  constructor(
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
  ) {
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.chatService = chatService;
  }
  getGetChatTaskname(): string {
    return GetChatTask.name;
  }
  getPublishMessageTaskName(): string {
    return PublishMessageTask.name;
  }
  createGetTask(member: Member, objectId: string): Task<Actor, Chat> {
    return new GetChatTask(
      member,
      objectId,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
    );
  }
  createPublishMessageTask(
    member: Member,
    chatId: string,
    message: ChatMessage,
  ): Task<Actor, ChatMessage> {
    return new PublishMessageTask(
      member,
      chatId,
      message,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
    );
  }
}
