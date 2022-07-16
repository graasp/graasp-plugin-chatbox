/**
 * Chat websocket events are registered under these topics
 */

import { ChatMention } from '../interfaces/chat-mention';

// item chat messages
export const chatMentionTopic = 'mentions';

/**
 * All websocket events for chats will have this shape
 */
interface ChatMentionEvent {
  op: string;
  mention?: ChatMention;
}

/**
 * Events for item chats
 */
interface MentionEvent extends ChatMentionEvent {
  op: 'publish' | 'delete' | 'update' | 'clear';
  mention?: ChatMention;
}

/**
 * Factory for ItemChatEvent
 * @param op operation of the event
 * @param mention message value
 * @returns instance of item chat event
 */
export const ItemChatEvent = (
  op: MentionEvent['op'],
  mention?: ChatMention,
): // eslint-disable-next-line @typescript-eslint/no-unused-vars
MentionEvent => ({
  op,
  mention,
});
