import { BaseGraaspError } from '@graasp/sdk';

import { PLUGIN_NAME } from '../constants/constants';

/**
 * Errors thrown by the chat tasks
 */

export class ItemNotFound extends BaseGraaspError {
  origin = PLUGIN_NAME;
  constructor(data?: unknown) {
    super(
      { code: 'GICERR001', statusCode: 404, message: 'Item not found' },
      data,
    );
  }
}

export class MemberCannotReadItem extends BaseGraaspError {
  origin = PLUGIN_NAME;
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

export class ChatMessageNotFound extends BaseGraaspError {
  origin = PLUGIN_NAME;
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
