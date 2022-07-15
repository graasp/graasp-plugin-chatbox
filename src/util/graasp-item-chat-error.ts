import { ErrorFactory } from '@graasp/sdk';

import { PLUGIN_NAME } from '../constants/constants';

/**
 * Errors thrown by the chat tasks
 */

export const GraaspChatboxError = ErrorFactory(PLUGIN_NAME);

export class ItemNotFound extends GraaspChatboxError {
  constructor(data?: unknown) {
    super(
      { code: 'GICERR001', statusCode: 404, message: 'Item not found' },
      data,
    );
  }
}

export class MemberCannotReadItem extends GraaspChatboxError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GICERR002',
        statusCode: 403,
        message: 'Member cannot read item',
      },
      data,
    );
  }
}

export class ChatMessageNotFound extends GraaspChatboxError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GICERR003',
        statusCode: 404,
        message: 'Chat Message not found',
      },
      data,
    );
  }
}

export class MemberCannotEditMention extends GraaspItemChatError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GICERR004',
        statusCode: 401,
        message: 'Member can only edit own mentions',
      },
      data,
    );
  }
}
