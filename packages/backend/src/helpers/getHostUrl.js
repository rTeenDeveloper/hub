import astra from './astra';

export default function getHostUrl() {
  let hostUrl = 'http';
  if (astra.get('server.https', true)) hostUrl += 's';
  hostUrl += `://${astra.get('server.host', 'localhost')}`;
  if (astra.has('server.port')) hostUrl += `:${astra.get('server.port')}`;
  return hostUrl;
}
