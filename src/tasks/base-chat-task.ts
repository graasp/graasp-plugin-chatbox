import { FastifyLoggerInstance } from 'fastify';
import {
  Actor,
  DatabaseTransactionHandler,
  IndividualResultType,
  ItemMembershipService,
  ItemService,
  PostHookHandlerType,
  PreHookHandlerType,
  Task,
  TaskStatus,
} from 'graasp';
import { ChatService } from '../db-service';

/**
 * Abstract base task definition for operations on the chat database
 */
export abstract class BaseChatTask<R> implements Task<Actor, R> {
  protected itemService: ItemService;
  protected itemMembershipService: ItemMembershipService;
  protected chatService: ChatService;
  protected _result: R;
  protected _message: string;

  readonly actor: Actor;

  status: TaskStatus;
  targetId: string;
  data: Partial<IndividualResultType<R>>;
  preHookHandler: PreHookHandlerType<R>;
  postHookHandler: PostHookHandlerType<R>;

  input?: unknown;
  skip?: boolean;

  getInput?: () => unknown;
  getResult?: () => unknown;

  constructor(
    actor: Actor,
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

  /**
   * Returns the name of the task
   */
  abstract get name(): string;
  get result(): R {
    return this._result;
  }
  get message(): string {
    return this._message;
  }

  /**
   * Perform the task
   * @param handler database transaction handler
   * @param log logger instance
   */
  abstract run(
    handler: DatabaseTransactionHandler,
    log?: FastifyLoggerInstance,
  ): Promise<void | BaseChatTask<R>[]>;
}
