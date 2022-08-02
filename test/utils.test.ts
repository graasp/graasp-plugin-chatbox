import { paths } from '../src/constants/constants';
import { ITEM_ID, MESSAGE_ID } from './fixtures/mock-constants';
import { buildChatUrl } from './utils';

describe('Utils test', () => {
  it('should build the chat url', () => {
    expect(paths.getChat.test(buildChatUrl(ITEM_ID))).toBeTruthy();
  });

  it('should build chat url with messageId', () => {
    expect(
      paths.patchMessage.test(buildChatUrl(ITEM_ID, MESSAGE_ID)),
    ).toBeTruthy();
  });
});
