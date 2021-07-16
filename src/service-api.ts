/**
 * graasp-plugin-chat-box
 *
 * Fastify plugin for graasp-chatbox
 *
 * Implements back-end functionalities for chatboxes
 * in Graasp as a fastify server plugin
 */

import { FastifyPluginAsync } from "fastify";

/**
 * Type definition for plugin options
 */
interface GraaspChatboxPluginOptions {
  prefix?: string;
}

const plugin: FastifyPluginAsync<GraaspChatboxPluginOptions> = async (
  fastify,
  options
) => {};

export default plugin;
