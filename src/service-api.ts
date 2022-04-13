/**
 * graasp-plugin-chat-box
 *
 * Fastify plugin for graasp-chatbox
 *
 * Implements back-end functionalities for chatboxes
 * in Graasp as a fastify server plugin
 */

import { WebSocketService } from 'graasp-websockets';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ChatService } from './db-service';
import { ChatMessage } from './interfaces/chat-message';
import common, {
  getChat,
  patchMessage,
  publishMessage,
  removeMessage,
} from './schemas';
import { TaskManager } from './task-manager';
import { registerChatWsHooks } from './ws/hooks';
import {
  ActionHandlerInput,
  ActionService,
  ActionTaskManager,
  BaseAction,
} from 'graasp-plugin-actions';
import { CLIENT_HOSTS } from './constants/constants';
import { createChatActionHandler } from './handler/chat-action-handler';

// hack to force compiler to discover websockets service
declare module 'fastify' {
  interface FastifyInstance {
    websockets?: WebSocketService;
  }
}

/**
 * Type definition for plugin options
 */
export interface GraaspChatPluginOptions {
  prefix?: string;
}

const plugin: FastifyPluginAsync<GraaspChatPluginOptions> = async (
  fastify,
  _options,
) => {
  fastify.register(async function (fastify) {
    const {
      items: { dbService: itemService, taskManager: iTM },
      itemMemberships: { dbService: itemMembershipsService },
      taskRunner: runner,
      websockets,
      db,
    } = fastify;

    const chatService = new ChatService();
    const taskManager = new TaskManager(
      itemService,
      itemMembershipsService,
      chatService,
      iTM,
    );

    fastify.decorate('chat', { dbService: chatService, taskManager });

    fastify.addSchema(common);

    // register websocket behaviours for chats
    if (websockets) {
      registerChatWsHooks(
        websockets,
        runner,
        itemService,
        itemMembershipsService,
        taskManager,
        db.pool,
      );
    }

    // add actions
    const actionService = new ActionService();
    const actionTaskManager = new ActionTaskManager(
      actionService,
      CLIENT_HOSTS,
    );
    fastify.addHook('onSend', async (request, reply, payload) => {
      // todo: save public actions?
      if (request.member) {
        // wrap the createItemActionHandler in a new function to provide it with the properties we already have
        // todo: make better types -> use graasp constants or graasp types
        const actionHandler = (
          actionInput: ActionHandlerInput,
        ): Promise<BaseAction[]> =>
          createChatActionHandler(payload as string, actionInput);
        const createActionTask = actionTaskManager.createCreateTask(
          request.member,
          {
            request,
            reply,
            handler: actionHandler,
          },
        );
        await runner.runSingle(createActionTask);
      }
    });

    fastify.get<{ Params: { itemId: string } }>(
      '/:itemId/chat',
      { schema: getChat },
      async ({ member, params: { itemId }, log }) => {
        const tasks = taskManager.createGetTaskSequence(member, itemId);
        return runner.runSingleSequence(tasks, log);
      },
    );

    fastify.post<{ Params: { itemId: string }; Body: Partial<ChatMessage> }>(
      '/:itemId/chat',
      { schema: publishMessage },
      async ({ member, params: { itemId }, body, log }) => {
        const tasks = taskManager.createPublishMessageTaskSequence(
          member,
          itemId,
          body,
        );
        return runner.runSingleSequence(tasks, log);
      },
    );

    // patch message
    fastify.patch<{ Params: { itemId: string; messageId: string } }>(
      '/:itemId/chat/:messageId',
      { schema: patchMessage },
      async ({ member, params: { itemId, messageId }, body, log }) => {
        const tasks = taskManager.createPatchMessageTaskSequence(
          member,
          itemId,
          messageId,
          body,
        );
        return runner.runSingleSequence(tasks, log);
      },
    );

    // delete message
    fastify.delete<{ Params: { itemId: string; messageId: string } }>(
      '/:itemId/chat/:messageId',
      { schema: removeMessage },
      async ({ member, params: { itemId, messageId }, log }) => {
        const tasks = taskManager.createRemoveMessageTaskSequence(
          member,
          itemId,
          messageId,
        );
        return runner.runSingleSequence(tasks, log);
      },
    );
  });
};

export default fp(plugin, {
  fastify: '3.x',
  name: 'graasp-plugin-chatbox',
});
