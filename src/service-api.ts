/**
 * graasp-plugin-chat-box
 *
 * Fastify plugin for graasp-chatbox
 *
 * Implements back-end functionalities for chatboxes
 * in Graasp as a fastify server plugin
 */

import { FastifyPluginAsync } from 'fastify';
import { ChatService } from './db-service';
import { ChatMessage } from './interfaces/chat-message';
import common, { getChat, publishMessage } from './schemas';
import { TaskManager } from './task-manager';

/**
 * Type definition for plugin options
 */
interface GraaspChatPluginOptions {
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
  } = fastify;

  const chatService = new ChatService();
  const taskManager = new TaskManager(
    itemService,
    itemMembershipsService,
    chatService,
  );

  fastify.addSchema(common);

  fastify.get<{ Params: { itemId: string } }>(
    '/:itemid/chat',
    { schema: getChat },
    async ({ member, params: { itemId }, log }) => {
      const task = taskManager.createGetTask(member, itemId);
      return runner.runSingle(task, log);
    },
  );

  fastify.post<{ Params: { itemId: string }; Body: ChatMessage }>(
    '/:itemId/chat',
    { schema: publishMessage },
    async ({ member, params: { itemId }, body, log }) => {
      const task = taskManager.createPublishMessageTask(member, itemId, body);
      return runner.runSingle(task, log);
    },
  );
};

export default plugin;
