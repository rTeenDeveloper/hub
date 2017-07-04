/* eslint-disable no-undef */
import { createServer } from '../server';
import { initRequestLibrary, SERVER_URL } from '../testFixtures';

describe('server', () => {
  let server;
  let request;
  beforeEach(() => {
    request = initRequestLibrary();
    return createServer(3000).then(serverInstance => {
      server = serverInstance;
    });
  });
  afterEach(() => server.close());

  test('should start up on port 3000', async () => {
    const result = await request.get({
      uri: SERVER_URL,
      resolveWithFullResponse: true,
    });
    expect(result.statusCode).toBe(200);
  });

  test('should react to healthcheck', async () => {
    const result = await request.get({
      uri: `${SERVER_URL}/healthcheck`,
      resolveWithFullResponse: true,
      json: true,
    });
    expect(result.statusCode).toBe(200);
    expect(result.body.data).toEqual({ healthy: true });
  });
});
/* eslint-enable no-undef */
