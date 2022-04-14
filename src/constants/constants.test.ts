import { v4 } from 'uuid';
import { paths } from './constants';

describe('Constants', () => {
  it('paths', () => {
    const id = v4();
    const messageId = v4();
    expect(paths.getChat.test(`/items/${id}/chat`)).toBeTruthy();
    expect(paths.postMessage.test(`/items/${id}/chat`)).toBeTruthy();
    expect(
      paths.patchMessage.test(`/items/${id}/chat/${messageId}`),
    ).toBeTruthy();
    expect(
      paths.deleteMessage.test(`/items/${id}/chat/${messageId}`),
    ).toBeTruthy();
    expect(paths.deleteChat.test(`/items/${id}/chat`)).toBeTruthy();

    expect(paths.getChat.test(`/items/${id}/chat?id=moredata`)).toBeFalsy();
    expect(paths.postMessage.test(`/items/${id}/chat?id=moredata`)).toBeFalsy();
    expect(
      paths.patchMessage.test(`/items/${id}/chat?id=moredata`),
    ).toBeFalsy();
    expect(
      paths.deleteMessage.test(`/items/${id}/chat?id=moredata`),
    ).toBeFalsy();
    expect(paths.deleteChat.test(`/items/${id}/chat?id=moredata`)).toBeFalsy();
  });
});
