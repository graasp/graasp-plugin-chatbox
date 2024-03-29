/**
 * Chat websocket events are registered under these topics
 */
import { ChatMention } from '../interfaces/chat-mention';

// chat mentions topic
export const chatMentionTopic = 'mentions';

/**
 * All websocket events for chat mentions will have this shape
 */
interface ChatMentionEvent {
  op: string;
  mention?: ChatMention;
}

/**
 * Events for chat mentions
 */
interface MentionEvent extends ChatMentionEvent {
  op: 'publish' | 'delete' | 'update' | 'clear';
  mention?: ChatMention;
}

/**
 * Factory for MentionsEvent
 * @param op operation of the event
 * @param mention message value
 * @returns instance of item chat event
 */
export const MentionEvent = (
  op: MentionEvent['op'],
  mention?: ChatMention,
): // eslint-disable-next-line @typescript-eslint/no-unused-vars
MentionEvent => ({
  op,
  mention,
});
