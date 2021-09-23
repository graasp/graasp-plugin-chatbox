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
import { ChatService } from './db-service';
import { ChatMessage } from './interfaces/chat-message';
import common, { getChat, publishMessage } from './schemas';
import { TaskManager } from './task-manager';
import { registerChatWsHooks } from './ws/hooks';

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
  options,
) => {
  const {
    items: { dbService: itemService },
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

  fastify.get<{ Params: { itemId: string } }>(
    '/:itemId/chat',
    { schema: getChat },
    async ({ member, params: { itemId }, log }) => {
      const task = taskManager.createGetTask(member, itemId);
      return runner.runSingle(task, log);
    },
  );

  fastify.post<{ Params: { itemId: string }; Body: Partial<ChatMessage> }>(
    '/:itemId/chat',
    { schema: publishMessage },
    async ({ member, params: { itemId }, body, log }) => {
      const task = taskManager.createPublishMessageTask(member, itemId, body);
      return runner.runSingle(task, log);
    },
  );
};

export default plugin;
