export enum MentionStatus {
  UNREAD = 'unread',
  READ = 'read',
}

/**
 * Shape of a chat mention
 */
export interface ChatMention {
  id: string;
  messageId: string;
  memberId: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: MentionStatus;
}

/**
 * Shape of an object with the mentions of a member
 */
export interface MemberChatMentions {
  memberId: string;
  mentions: ChatMention[];
}
