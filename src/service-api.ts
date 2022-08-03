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

import { Hostname, Member, buildItemLinkForBuilder } from '@graasp/sdk';
import mailerPlugin from 'graasp-mailer';
import {
  ActionHandlerInput,
  ActionService,
  ActionTaskManager,
  BaseAction,
} from 'graasp-plugin-actions';

import { ChatService } from './chat/db-service';
import { createChatActionHandler } from './chat/handler/chat-action-handler';
import {
  ChatMessage,
  PartialChatMessage,
  PartialNewChatMessage,
} from './chat/interfaces/chat-message';
import commonChat, {
  clearChat,
  getChat,
  patchMessage,
  publishMessage,
  removeMessage,
} from './chat/schemas';
import { TaskManager as ChatTaskManager } from './chat/task-manager';
import { registerChatWsHooks } from './chat/ws/hooks';
import { MentionService } from './mentions/db-service';
import commonMentions, {
  clearAllMentions,
  deleteMention,
  getMentions,
  patchMention,
} from './mentions/schemas';
import { TaskManager as MentionsTaskManager } from './mentions/task-manager';
import { registerChatMentionsWsHooks } from './mentions/ws/hooks';

// hack to force compiler to discover websockets service
declare module 'fastify' {
  interface FastifyInstance {
    chat?: { taskManager: ChatTaskManager; dbService: ChatService };
  }
}

/**
 * Type definition for plugin options
 */
export interface GraaspChatPluginOptions {
  prefix?: string;
  hosts: Hostname[];
  hostname?: string;
}

const plugin: FastifyPluginAsync<GraaspChatPluginOptions> = async (
  fastify,
  options,
) => {
  const {
    items: { dbService: itemService, taskManager: iTM },
    itemMemberships: { dbService: itemMembershipsService, taskManager: iMTM },
    members: { taskManager: memberTM },
    taskRunner: runner,
    websockets,
    db,
    mailer,
  } = fastify;

  if (!mailerPlugin) {
    throw new Error('Mailer plugin is not defined');
  }

  const chatService = new ChatService();
  const mentionService = new MentionService();
  const taskManager = new ChatTaskManager(
    itemService,
    itemMembershipsService,
    chatService,
    mentionService,
    iTM,
    iMTM,
    memberTM,
  );

  fastify.decorate('chat', {
    dbService: chatService,
    taskManager,
  });

  // isolate plugin content using fastify.register to ensure that the hooks will not be called when other routes match
  fastify.register(async function (fastify) {
    fastify.addSchema(commonChat);
    fastify.addSchema(commonMentions);

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

    const sendMentionNotificationEmail = ({ item, member, log }) => {
      const itemLink = buildItemLinkForBuilder({
        host: options.hostname,
        itemId: item.id,
        chatOpen: true,
      });
      const lang = member?.extra?.lang as string;

      mailer
        .sendChatMentionNotificationEmail(
          member,
          itemLink,
          item.name,
          member.name,
          lang,
        )
        .catch((err) => {
          log.warn(err, `mailer failed. notification link: ${itemLink}`);
        });
    };

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

    fastify.post<{
      Params: { itemId: string };
      Body: Partial<PartialNewChatMessage>;
    }>(
      '/:itemId/chat',
      { schema: publishMessage },
      async ({ member, params: { itemId }, body, log }) => {
        const tasks = taskManager.createPublishMessageTaskSequence(
          member,
          itemId,
          body.body,
        );

        const { message, mentionedUsers } = (await runner.runSingleSequence(
          tasks,
          log,
        )) as { message: ChatMessage; mentionedUsers: (Member | Error)[] };
        if (mentionedUsers && mentionedUsers.length > 0) {
          const { result: item } = tasks[0];
          mentionedUsers.forEach((mentionedUser) => {
            if (!(mentionedUser instanceof Error)) {
              sendMentionNotificationEmail({
                item,
                member: mentionedUser,
                log,
              });
            }
          });
        }
        return message;
      },
    );

    // patch message
    fastify.patch<{
      Params: { itemId: string; messageId: string };
      Body: Partial<PartialChatMessage>;
    }>(
      '/:itemId/chat/:messageId',
      { schema: patchMessage },
      async ({ member, params: { itemId, messageId }, body, log }) => {
        const tasks = taskManager.createPatchMessageTaskSequence(
          member,
          itemId,
          messageId,
          body.body,
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

  // isolate plugin content using fastify.register to ensure that the hooks will not be called when other routes match
  fastify.register(async function (fastify) {
    const {
      items: { dbService: itemService, taskManager: iTM },
      members: { dbService: membersService },
      itemMemberships: { dbService: itemMembershipsService, taskManager: iMTM },
      chat: { taskManager: chatTaskManager },
      taskRunner: runner,
      websockets,
      db,
    } = fastify;

    const mentionService = new MentionService();
    const taskManager = new MentionsTaskManager(
      itemService,
      itemMembershipsService,
      mentionService,
      iTM,
      iMTM,
    );

    fastify.decorate('mentions', {
      dbService: mentionService,
      taskManager,
    });

    fastify.addSchema(commonMentions);

    // register websocket behaviours for chats
    if (websockets) {
      registerChatMentionsWsHooks(
        websockets,
        runner,
        mentionService,
        membersService,
        itemMembershipsService,
        iTM,
        chatTaskManager,
        taskManager,
        db.pool,
      );
    }

    // mentions
    fastify.get(
      '/mentions',
      { schema: getMentions },
      async ({ member, log }) => {
        const task = taskManager.createGetMemberMentionsTask(member);
        return runner.runSingle(task, log);
      },
    );

    fastify.patch<{ Params: { mentionId: string }; Body: { status: string } }>(
      '/mentions/:mentionId',
      { schema: patchMention },
      async ({ member, params: { mentionId }, body: { status }, log }) => {
        const tasks = taskManager.createPatchMentionTaskSequence(
          member,
          mentionId,
          status,
        );
        return runner.runSingleSequence(tasks, log);
      },
    );

    // delete one mention by id
    fastify.delete<{ Params: { mentionId: string } }>(
      '/mentions/:mentionId',
      { schema: deleteMention },
      async ({ member, params: { mentionId }, log }) => {
        const tasks = taskManager.createDeleteMentionTaskSequence(
          member,
          mentionId,
        );
        return runner.runSingleSequence(tasks, log);
      },
    );

    // delete all mentions for a user
    fastify.delete(
      '/mentions',
      { schema: clearAllMentions },
      async ({ member, log }) => {
        const tasks = taskManager.createClearAllMentionsTaskSequence(member);
        return runner.runSingleSequence(tasks, log);
      },
    );
  });
};

export default fp(plugin, {
  fastify: '3.x',
  name: 'graasp-plugin-chatbox',
});
