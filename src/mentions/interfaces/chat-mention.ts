/**
 * Shape of a chat mention
 */
import { MentionStatus } from '@graasp/sdk';

export interface ChatMention {
  id: string;
  messageId: string;
  memberId: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: MentionStatus;
  message?: string;
}

/**
 * Shape of an object with the mentions of a member
 */
export interface MemberChatMentions {
  memberId: string;
  mentions: ChatMention[];
}
