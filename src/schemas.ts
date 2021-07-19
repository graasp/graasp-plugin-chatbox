export default {
  $id: 'http://graasp.org/chat/',
  definitions: {
    itemIdParam: {
      type: 'object',
      required: ['itemId'],
      properties: {
        itemId: { $ref: 'http://graasp.org/#/definitions/uuid' },
      },
    },

    chat: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        messages: {
          type: 'array',
          items: {
            type: { $ref: '#/definitions/chatMessage' },
          },
        },
      },
    },

    chatMessage: {
      type: 'object',
      properties: {
        chatId: { $ref: 'http://graasp.org/#/definitions/uuid' },
        creator: { $ref: 'http://graasp.org/#/definitions/uuid' },
        createdAt: { type: 'string' },
        body: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

const getChat = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/itemIdParam' },
  response: {
    200: { $ref: 'http://graasp.org/chat/#/definitions/chat' },
  },
};

const publishMessage = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/itemIdParam' },
  body: { $ref: 'http://graasp.org/chat/#/definitions/chatMessage' },
  response: {
    201: { $ref: 'http://graasp.org/chat/#/definitions/chatMessage' },
  },
};

export { getChat, publishMessage };
