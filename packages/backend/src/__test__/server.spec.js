/* eslint-disable no-undef */
import { createServer } from '../server';
import { initRequestLibrary, SERVER_URL } from '../testFixtures';

describe('createServer()', () => {
  test('should return closeable server', async () => {
    const server = await createServer(3001);
    expect(server.close).toBeDefined();
    expect(server.closeDb).toBeDefined();
    expect(server.shutdownServer).toBeDefined();
    await server.shutdownServer();
  });
});

describe('server', () => {
  let server;
  let request;
  beforeAll(() => {
    request = initRequestLibrary();
    return createServer(3000).then(serverInstance => {
      server = serverInstance;
    });
  });

  afterAll(() => server.shutdownServer());

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
