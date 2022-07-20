import {
  Actor,
  ItemMembershipService,
  ItemMembershipTaskManager,
  ItemService,
  ItemTaskManager,
  Member,
  Task,
} from '@graasp/sdk';

import { MentionService } from './db-service';
import { ChatMention, MemberChatMentions } from './interfaces/chat-mention';
import { ChatMentionsTaskManager } from './interfaces/chat-mentions-task-manager';
import { ClearAllMentionsTask } from './tasks/clear-all-mentions-task';
import { CreateMentionsTask } from './tasks/create-mentions-task';
import { DeleteMentionTask } from './tasks/delete-mention-task';
import { GetMemberMentionsTask } from './tasks/get-mentions-task';
import { IsOwnMentionTask } from './tasks/is-own-mention-task';
import { UpdateMentionStatusTask } from './tasks/update-mention-status-task';

/**
 * Concrete implementation of the chat mention task manager
 */
export class TaskManager implements ChatMentionsTaskManager {
  private itemService: ItemService;
  private itemMembershipService: ItemMembershipService;
  private mentionService: MentionService;
  private itemTaskManager: ItemTaskManager;
  private itemMembershipTaskManager: ItemMembershipTaskManager;

  constructor(
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    mentionService: MentionService,
    itemTaskManager: ItemTaskManager,
    itemMembershipTaskManager: ItemMembershipTaskManager,
  ) {
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.mentionService = mentionService;
    this.itemTaskManager = itemTaskManager;
    this.itemMembershipTaskManager = itemMembershipTaskManager;
  }

  getCreateMentionsTaskName(): string {
    return CreateMentionsTask.name;
  }

  getGetMemberMentionsTaskName(): string {
    return GetMemberMentionsTask.name;
  }

  getUpdateMentionStatusTaskName(): string {
    return UpdateMentionStatusTask.name;
  }

  getDeleteMentionTaskName(): string {
    return DeleteMentionTask.name;
  }

  getClearAllMentionsTaskName(): string {
    return ClearAllMentionsTask.name;
  }

  createGetMemberMentionsTask(member: Actor): Task<Actor, MemberChatMentions> {
    return new GetMemberMentionsTask(member, this.mentionService);
  }

  createPatchMentionTaskSequence(
    member: Member,
    mentionId: string,
    status: string,
  ): Task<Actor, unknown>[] {
    const t1 = new IsOwnMentionTask(member, mentionId, this.mentionService);
    const t2 = new UpdateMentionStatusTask(
      member,
      mentionId,
      this.mentionService,
      { status },
    );
    t2.getInput = () => ({
      mention: t1.result as ChatMention,
    });
    return [t1, t2];
  }

  createDeleteMentionTaskSequence(
    member: Member,
    mentionId: string,
  ): Task<Actor, unknown>[] {
    const t1 = new IsOwnMentionTask(member, mentionId, this.mentionService);
    const t2 = new DeleteMentionTask(member, mentionId, this.mentionService);
    return [t1, t2];
  }

  createClearAllMentionsTaskSequence(member: Member): Task<Actor, unknown>[] {
    const t1 = new ClearAllMentionsTask(member, this.mentionService);
    return [t1];
  }
}
