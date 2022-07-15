import {
  Actor,
  Item,
  ItemMembershipService,
  ItemMembershipTaskManager,
  ItemService,
  ItemTaskManager,
  Member,
  PermissionLevel,
  Task,
} from '@graasp/sdk';

import { ChatService } from './chat/db-service';
import { Chat } from './chat/interfaces/chat';
import { MessageBodyType } from './chat/interfaces/chat-message';
import { ChatTaskManager } from './chat/interfaces/chat-task-manager';
import { GetChatTask } from './chat/tasks/get-chat-task';
import { PublishMessageTask } from './chat/tasks/publish-message-task';
import { DeleteMessageTask } from './chat/tasks/delete-message-task';
import { PatchMessageTask } from './chat/tasks/patch-message-task';
import { ClearChatTask } from './chat/tasks/clear-chat-task';
import { GetMessageTask } from './chat/tasks/get-message-task';
import { CreateMentionsTask } from './mentions/tasks/create-mentions-task';
import { MentionService } from './mentions/db-service';
import { GetMemberMentionsTask } from './mentions/tasks/get-mentions-task';
import { ChatMention } from './mentions/interfaces/chat-mention';
import { UpdateMentionStatusTask } from './mentions/tasks/update-mention-status-task';
import { IsOwnMentionTask } from './mentions/tasks/is-own-mention-task';
import { DeleteMentionTask } from './mentions/tasks/delete-mention-task';
import { ClearAllMentionsTask } from './mentions/tasks/clear-all-mentions-task';

/**
 * Concrete implementation of the chat task manager
 */
export class TaskManager implements ChatTaskManager {
  private itemService: ItemService;
  private itemMembershipService: ItemMembershipService;
  private chatService: ChatService;
  private mentionService: MentionService;
  private itemTaskManager: ItemTaskManager;
  private itemMembershipTaskManager: ItemMembershipTaskManager;

  constructor(
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
    mentionService: MentionService,
    itemTaskManager: ItemTaskManager,
    itemMembershipTaskManager: ItemMembershipTaskManager,
  ) {
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.chatService = chatService;
    this.mentionService = mentionService;
    this.itemTaskManager = itemTaskManager;
    this.itemMembershipTaskManager = itemMembershipTaskManager;
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

  getClearChatTaskName(): string {
    return ClearChatTask.name;
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

  createGetMemberMentionsTask(member: Actor): Task<Actor, ChatMention[]> {
    return new GetMemberMentionsTask(
      member,
      this.itemService,
      this.mentionService,
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
    chatBody: MessageBodyType,
  ): Task<Actor, unknown>[] {
    const { message, mentions } = chatBody;
    const t1 = this.itemTaskManager.createGetTaskSequence(member, chatId);
    const t2 = new PublishMessageTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      {
        chatId,
        message,
      },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });
    const t3 = new CreateMentionsTask(
      member,
      this.itemService,
      this.mentionService,
      { mentions },
    );
    // supply mention task with item and chat-message id
    t3.getInput = () => ({
      item: t1[0].result as Item,
      messageId: t2.result.id,
    });
    // make the task return the chat-message and not the mentions
    t3.getResult = () => t2.result;
    return [...t1, t2, t3];
  }

  createPatchMessageTaskSequence(
    member: Member,
    chatId: string,
    messageId: string,
    chatBody: MessageBodyType,
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
        message: chatBody.message,
      },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });

    return [...t1, t2];
  }

  createPatchMentionTaskSequence(
    member: Member,
    mentionId: string,
    status: string,
  ): Task<Actor, unknown>[] {
    const t1 = new IsOwnMentionTask(
      member,
      mentionId,
      this.itemService,
      this.mentionService,
    );
    const t2 = new UpdateMentionStatusTask(
      member,
      mentionId,
      this.itemService,
      this.mentionService,
      { status },
    );
    return [t1, t2];
  }

  createRemoveMessageTaskSequence(
    member: Member,
    chatId: string,
    messageId: string,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, chatId);
    // get message to check the creator
    const t2 = new GetMessageTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      { messageId },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });
    // check if the member can admin the message
    const t3 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(
      member,
      { validatePermission: PermissionLevel.Admin },
    );
    // skip the task if the member is creator of the message
    t3.getInput = () => {
      t3.skip = t2.result.creator === member.id;
      return { item: t1[0].result as Item };
    };
    const t4 = new DeleteMessageTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      {
        chatId,
        messageId,
      },
    );

    return [...t1, t2, t3, t4];
  }

  createDeleteMentionTaskSequence(
    member: Member,
    mentionId: string,
  ): Task<Actor, unknown>[] {
    const t1 = new IsOwnMentionTask(
      member,
      mentionId,
      this.itemService,
      this.mentionService,
    );
    const t2 = new DeleteMentionTask(
      member,
      mentionId,
      this.itemService,
      this.mentionService,
    );
    return [t1, t2];
  }

  createClearChatTaskSequence(
    member: Member,
    chatId: string,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, chatId);
    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(
      member,
      { validatePermission: PermissionLevel.Admin },
    );
    t2.getInput = () => ({ item: t1[0].result as Item });
    const t3 = new ClearChatTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.chatService,
      {
        chatId,
      },
    );

    return [...t1, t2, t3];
  }

  createClearAllMentionsTaskSequence(member: Member): Task<Actor, unknown>[] {
    const t1 = new ClearAllMentionsTask(
      member,
      this.itemService,
      this.mentionService,
    );
    return [t1];
  }
}
