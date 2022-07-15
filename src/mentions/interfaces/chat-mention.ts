export enum MentionStatus {
  UNREAD = 'unread',
  READ = 'read',
}

/**
 * Shape of chat messages
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
