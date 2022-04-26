import { FastifyLoggerInstance, FastifyReply, FastifyRequest } from 'fastify';
import { METHODS, ACTION_TYPES } from '../constants/constants';
import { DatabaseTransactionHandler } from 'graasp';
import { createChatActionHandler } from './chat-action-handler';
import { ITEM_ID, MESSAGE_ID } from '../../test/fixtures/mock-constants';
import { buildChatUrl, checkActionData, GRAASP_ACTOR } from '../../test/utils';

// dbHandler can be null as we do not use it with the mock itemService
const dbTransactionHandler = null as unknown as DatabaseTransactionHandler;
const reply = null as unknown as FastifyReply;
const log = { debug: jest.fn() } as unknown as FastifyLoggerInstance;
const request = {
  url: buildChatUrl(ITEM_ID),
  method: METHODS.POST,
  member: GRAASP_ACTOR,
  params: { itemId: ITEM_ID },
  query: {},
  ip: '',
  headers: {},
} as unknown as FastifyRequest;
const payload = {
  id: MESSAGE_ID,
  chatId: ITEM_ID,
  creator: GRAASP_ACTOR.id,
  createdAt: '2022-04-01T13:14:52.922Z',
  updatedAt: null,
  body: '',
};
const actionInput = {
  reply,
  log,
  dbHandler: dbTransactionHandler,
};

describe('Build actions', () => {
  it('should return empty actions array when path does not match', async () => {
    const invalidPathRequest = {
      ...request,
      url: `/items/${ITEM_ID}`,
    };
    const savedActions = await createChatActionHandler(
      JSON.stringify(payload),
      {
        ...actionInput,
        request: invalidPathRequest,
      },
    );
    // should be empty because no paths matches
    expect(savedActions.length).toEqual(0);
  });

  it('POST chat message', async () => {
    const messageBody = 'Ding here is a message !';
    const validPostRequest = {
      ...request,
      method: METHODS.POST,
      url: buildChatUrl(ITEM_ID),
      body: messageBody,
    };
    const postPayload = {
      ...payload,
      body: messageBody,
    };
    const savedActions = await createChatActionHandler(
      JSON.stringify(postPayload),
      {
        ...actionInput,
        request: validPostRequest,
      },
    );
    // should contain one action to save
    expect(savedActions.length).toEqual(1);
    checkActionData(savedActions[0], {
      actionType: ACTION_TYPES.CREATE,
      message: postPayload,
    });
  });

  it('PATCH chat message', async () => {
    const newMessageBody = 'Updated content';
    const validPatchRequest = {
      ...request,
      method: METHODS.PATCH,
      url: buildChatUrl(ITEM_ID, MESSAGE_ID),
      body: newMessageBody,
    };
    const patchPayload = {
      ...payload,
      body: newMessageBody,
      updatedAt: '2022-04-01T13:26:02.849Z',
    };
    const savedActions = await createChatActionHandler(
      JSON.stringify(patchPayload),
      {
        ...actionInput,
        request: validPatchRequest,
      },
    );
    // should contain one action to save
    expect(savedActions.length).toEqual(1);
    checkActionData(savedActions[0], {
      actionType: ACTION_TYPES.UPDATE,
      message: patchPayload,
    });
  });

  it('DELETE chat message', async () => {
    const validDeleteRequest = {
      ...request,
      method: METHODS.DELETE,
      url: buildChatUrl(ITEM_ID, MESSAGE_ID),
    };
    const deletePayload = {
      ...payload,
      updatedAt: '2022-04-01T13:26:02.849Z',
    };
    const savedActions = await createChatActionHandler(
      JSON.stringify(deletePayload),
      {
        ...actionInput,
        request: validDeleteRequest,
      },
    );
    // should contain one action to save
    expect(savedActions.length).toEqual(1);
    checkActionData(savedActions[0], {
      actionType: ACTION_TYPES.DELETE,
      message: deletePayload,
    });
  });

  it('CLEAR chat', async () => {
    const validClearRequest = {
      ...request,
      method: METHODS.DELETE,
      url: buildChatUrl(ITEM_ID),
    };
    const clearPayload = {
      id: ITEM_ID,
      messages: [],
    };
    const savedActions = await createChatActionHandler(
      JSON.stringify(clearPayload),
      {
        ...actionInput,
        request: validClearRequest,
      },
    );
    // should contain one action to save
    expect(savedActions.length).toEqual(1);
    checkActionData(savedActions[0], {
      actionType: ACTION_TYPES.CLEAR,
      chatId: ITEM_ID,
    });
  });
});
