/**
 * graasp-plugin-chatbox
 *
 * Public fastify plugin for graasp-chatbox
 *
 * Implements back-end functionalities for chatboxes
 * in Graasp as a fastify server plugin
 */
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// import this plugin to apply fastify declaration (public)
import publicPlugin from 'graasp-plugin-public';
import { WebSocketService } from 'graasp-websockets';

import { ChatService } from './chat/db-service';
import common, { getChat } from './chat/schemas';
import { TaskManager } from './task-manager';
import { MentionService } from './mentions/db-service';

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

const plugin: FastifyPluginAsync<GraaspChatPluginOptions> = async (fastify) => {
  const {
    items: { dbService: itemService, taskManager: iTM },
    itemMemberships: { dbService: itemMembershipsService, taskManager: iMTM },
    taskRunner: runner,
    public: {
      items: { taskManager: pITM },
      graaspActor,
    },
  } = fastify;

  if (!publicPlugin) {
    throw new Error('The public plugin is not correctly defined');
  }

  const chatService = new ChatService();
  const mentionService = new MentionService();
  const taskManager = new TaskManager(
    itemService,
    itemMembershipsService,
    chatService,
    mentionService,
    iTM,
    iMTM,
  );

  fastify.addSchema(common);

  fastify.get<{ Params: { itemId: string } }>(
    '/:itemId/chat',
    { schema: getChat },
    async ({ params: { itemId }, log }) => {
      const t1 = pITM.createGetPublicItemTask(graaspActor, { itemId });
      const t2 = taskManager.createGetTask(graaspActor, itemId);
      return runner.runSingleSequence([t1, t2], log);
    },
  );
};

export default fp(plugin, {
  fastify: '3.x',
  name: 'graasp-plugin-public-chatbox',
});
