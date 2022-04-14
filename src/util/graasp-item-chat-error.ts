import { GraaspError, GraaspErrorDetails } from 'graasp';

/**
 * Errors thrown by the chat tasks
 */
export class GraaspItemChatError implements GraaspError {
  name: string;
  code: string;
  message: string;
  statusCode?: number;
  data?: unknown;
  origin: 'core' | 'plugin';

  constructor(
    { code, statusCode, message }: GraaspErrorDetails,
    data?: unknown,
  ) {
    this.name = code;
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.origin = 'plugin';
  }
}

export class ItemNotFound extends GraaspItemChatError {
  constructor(data?: unknown) {
    super(
      { code: 'GICERR001', statusCode: 404, message: 'Item not found' },
      data,
    );
  }
}

export class MemberCannotReadItem extends GraaspItemChatError {
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

export class ChatMessageNotFound extends GraaspItemChatError {
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

export class MemberCanNotDeleteMessage extends GraaspItemChatError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GICERR004',
        statusCode: 403,
        message: 'Member can not delete messages that are not his own',
      },
      data,
    );
  }
}

export class MemberCanNotClearChat extends GraaspItemChatError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GICERR005',
        statusCode: 403,
        message: 'Member has insufficient permissions to clear this chat',
      },
      data,
    );
  }
}
