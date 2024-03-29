/**
 * JSON schema definitions to validate requests and responses
 * through Fastify's AJV instance
 */
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

    messageParam: {
      type: 'object',
      required: ['itemId', 'messageId'],
      properties: {
        itemId: { $ref: 'http://graasp.org/#/definitions/uuid' },
        messageId: { $ref: 'http://graasp.org/#/definitions/uuid' },
      },
    },

    chat: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        messages: {
          type: 'array',
          items: { $ref: '#/definitions/chatMessage' },
        },
      },
    },

    chatMessage: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        chatId: { $ref: 'http://graasp.org/#/definitions/uuid' },
        creator: { $ref: 'http://graasp.org/#/definitions/uuid' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        body: { type: 'string' },
      },
      additionalProperties: false,
    },

    // chat message properties required at creation
    partialChatMessage: {
      type: 'object',
      required: ['body'],
      properties: {
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
            },
            mentions: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 0,
            },
          },
        },
      },
      additionalProperties: false,
    },

    chatMessageWithMemberName: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        chatId: { $ref: 'http://graasp.org/#/definitions/uuid' },
        creator: { $ref: 'http://graasp.org/#/definitions/uuid' },
        creatorName: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        body: { type: 'string' },
      },
      additionalProperties: false,
    },

    // export chat with creatorName
    exportedChat: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        messages: {
          type: 'array',
          items: { $ref: '#/definitions/chatMessageWithMemberName' },
        },
      },
    },
  },
};

/**
 * JSON schema on GET chat route for request and response
 */
const getChat = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/itemIdParam' },
  response: {
    200: { $ref: 'http://graasp.org/chat/#/definitions/chat' },
  },
};

/**
 * JSON schema on GET chat route for request and response
 */
const exportChat = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/itemIdParam' },
  response: {
    200: { $ref: 'http://graasp.org/chat/#/definitions/exportedChat' },
  },
};

/**
 * JSON schema on POST publish message route for request and response
 */
const publishMessage = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/itemIdParam' },
  body: { $ref: 'http://graasp.org/chat/#/definitions/partialChatMessage' },
  response: {
    201: { $ref: 'http://graasp.org/chat/#/definitions/chatMessage' },
  },
};

/**
 * JSON schema on PATCH message route for request and response
 */
const patchMessage = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/messageParam' },
  body: { $ref: 'http://graasp.org/chat/#/definitions/partialChatMessage' },
  response: {
    200: { $ref: 'http://graasp.org/chat/#/definitions/chatMessage' },
  },
};

/**
 * JSON schema on DELETE remove message route for request and response
 */
const removeMessage = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/messageParam' },
  response: {
    200: { $ref: 'http://graasp.org/chat/#/definitions/chatMessage' },
  },
};

/**
 * JSON schema on DELETE clear chat route for request and response
 */
const clearChat = {
  params: { $ref: 'http://graasp.org/chat/#/definitions/itemIdParam' },
  response: {
    200: { $ref: 'http://graasp.org/chat/#/definitions/chat' },
  },
};

export {
  getChat,
  exportChat,
  publishMessage,
  patchMessage,
  removeMessage,
  clearChat,
};
