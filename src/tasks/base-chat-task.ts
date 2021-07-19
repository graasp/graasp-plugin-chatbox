import { FastifyLoggerInstance } from 'fastify';
import {
  Actor,
  DatabaseTransactionHandler,
  IndividualResultType,
  ItemMembershipService,
  ItemService,
  Member,
  PostHookHandlerType,
  PreHookHandlerType,
  Task,
  TaskStatus,
} from 'graasp';
import { ChatService } from '../db-service';

export abstract class BaseChatTask<R> implements Task<Actor, R> {
  protected itemService: ItemService;
  protected itemMembershipService: ItemMembershipService;
  protected chatService: ChatService;
  protected _result: R;
  protected _message: string;

  readonly actor: Member;

  status: TaskStatus;
  targetId: string;
  data: IndividualResultType<R>;
  preHookHandler: PreHookHandlerType<R>;
  postHookHandler: PostHookHandlerType<R>;

  constructor(
    actor: Member,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    chatService: ChatService,
  ) {
    this.actor = actor;
    this.status = 'NEW';
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.chatService = chatService;
  }

  abstract get name(): string;
  get result(): R {
    return this._result;
  }
  get message(): string {
    return this._message;
  }

  abstract run(
    handler: DatabaseTransactionHandler,
    log?: FastifyLoggerInstance,
  ): Promise<void | BaseChatTask<R>[]>;
}
