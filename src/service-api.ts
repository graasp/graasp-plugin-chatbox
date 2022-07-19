/**
 * graasp-plugin-chat-box
 *
 * Fastify plugin for graasp-chatbox
 *
 * Implements back-end functionalities for chatboxes
 * in Graasp as a fastify server plugin
 */
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { Hostname } from '@graasp/sdk';
import {
  ActionHandlerInput,
  ActionService,
  ActionTaskManager,
  BaseAction,
} from 'graasp-plugin-actions';

import { ChatService } from './db-service';
import { createChatActionHandler } from './handler/chat-action-handler';
import { ChatMessage } from './interfaces/chat-message';
import common, {
  clearChat,
  getChat,
  patchMessage,
  publishMessage,
  removeMessage,
} from './schemas';
import { TaskManager } from './task-manager';
import { registerChatWsHooks } from './ws/hooks';

/**
 * Type definition for plugin options
 */
export interface GraaspChatPluginOptions {
  prefix?: string;
  hosts: Hostname[];
}

const plugin: FastifyPluginAsync<GraaspChatPluginOptions> = async (
  fastify,
  options,
) => {
  // isolate plugin content using fastify.register to ensure that the hooks will not be called when other routes match
  fastify.register(async function (fastify) {
    const {
      items: { dbService: itemService, taskManager: iTM },
      itemMemberships: { dbService: itemMembershipsService, taskManager: iMTM },
      members: { taskManager: memberTM },
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
      iMTM,
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
      iTM,
      iMTM,
      memberTM,
      options.hosts,
    );
    fastify.addHook('onSend', async (request, reply, payload) => {
      // todo: save public actions?
      if (request.member) {
        // wrap the createItemActionHandler in a new function to provide it with the properties we already have
        // todo: make better types -> use graasp constants or graasp types
        const actionHandler = (
          actionInput: ActionHandlerInput,
        ): Promise<BaseAction[]> =>
          createChatActionHandler(
            itemService,
            payload as string,
            actionInput,
            options.hosts,
          );
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

    // clear chat
    fastify.delete<{ Params: { itemId: string } }>(
      '/:itemId/chat',
      { schema: clearChat },
      async ({ member, params: { itemId }, log }) => {
        const tasks = taskManager.createClearChatTaskSequence(member, itemId);
        return runner.runSingleSequence(tasks, log);
      },
    );
  });
};

export default fp(plugin, {
  fastify: '3.x',
  name: 'graasp-plugin-chatbox',
});
