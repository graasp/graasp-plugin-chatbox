import {
  Actor,
  Item,
  ItemMembershipService,
  ItemService,
  ItemTaskManager,
  Member,
  Task,
} from 'graasp';
import { ChatService } from './db-service';
import { Chat } from './interfaces/chat';
import { ChatMessage } from './interfaces/chat-message';
import { ChatTaskManager } from './interfaces/chat-task-manager';
import { GetChatTask } from './tasks/get-chat-task';
import { PublishMessageTask } from './tasks/publish-message-task';
import { DeleteMessageTask } from './tasks/delete-message-task';
import { PatchMessageTask } from './tasks/patch-message-task';
import { DeleteChatTask } from './tasks/delete-chat-task';

/**
 * Concrete implementation of the chat task manager
 */
export class TaskManager implements ChatTaskManager {
  private itemService: ItemService;
  private itemMembershipService: ItemMembershipService;
  private chatService: ChatService;
  private itemTaskManager: ItemTaskManager;

  constructor(
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
    itemTaskManager: ItemTaskManager,
  ) {
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.chatService = chatService;
    this.itemTaskManager = itemTaskManager;
  }
  getGetChatTaskName(): string {
    return GetChatTask.name;
  }
  getPublishMessageTaskName(): string {
    return PublishMessageTask.name;
  }
  getPatchMessageTaskName(): string {
    return PatchMessageTask.name;
  }
  getDeleteMessageTaskName(): string {
    return DeleteMessageTask.name;
  }
  getDeleteChatTaskName(): string {
    return DeleteMessageTask.name;
  }
  createGetTask(member: Actor, objectId: string): Task<Actor, Chat> {
    return new GetChatTask(
      member,
      objectId,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
    );
  }

  createGetTaskSequence(
    member: Member,
    objectId: string,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, objectId);
    const t2 = new GetChatTask(
      member,
      objectId,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
    );

    return [...t1, t2];
  }

  createPublishMessageTaskSequence(
    member: Member,
    chatId: string,
    chatMessage: Partial<ChatMessage>,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, chatId);
    const t2 = new PublishMessageTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      {
        chatId,
        chatMessage,
      },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });

    return [...t1, t2];
  }

  createPatchMessageTaskSequence(
    member: Member,
    chatId: string,
    messageId: string,
    chatMessage: Partial<ChatMessage>,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, chatId);
    const t2 = new PatchMessageTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      {
        chatId,
        messageId,
        chatMessage,
      },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });

    return [...t1, t2];
  }

  createRemoveMessageTaskSequence(
    member: Member,
    chatId: string,
    messageId: string,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, chatId);
    const t2 = new DeleteMessageTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      {
        chatId,
        messageId,
      },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });

    return [...t1, t2];
  }

  createRemoveChatTaskSequence(
    member: Member,
    chatId: string,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, chatId);
    const t2 = new DeleteChatTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      {
        chatId,
      },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });

    return [...t1, t2];
  }
}
