import { FastifyLoggerInstance } from 'fastify';

import {
  DatabaseTransactionHandler,
  IndividualResultType,
  Member,
  PostHookHandlerType,
  PreHookHandlerType,
  Task,
  TaskStatus,
} from '@graasp/sdk';

import { MentionService } from '../db-service';

/**
 * Abstract base task definition for operations on the chat database
 */
export abstract class BaseMentionTask<R> implements Task<Member, R> {
  protected mentionService: MentionService;
  protected _result: R;
  protected _message: string;

  readonly actor: Member;

  status: TaskStatus;
  targetId: string;
  data: Partial<IndividualResultType<R>>;
  preHookHandler?: PreHookHandlerType<R>;
  postHookHandler?: PostHookHandlerType<R | string>;

  input?: unknown;
  skip?: boolean;

  getInput?: () => unknown;
  getResult?: () => unknown;

  constructor(actor: Member, mentionService: MentionService) {
    this.actor = actor;
    this.status = TaskStatus.NEW;
    this.mentionService = mentionService;
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
  ): Promise<void | BaseMentionTask<R>[]>;
}
