import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  override: {
    wrapper: 'cloudflare-node',
    converter: 'edge',
    proxyExternalRequest: 'fetch',
    incrementalCache: 'dummy',
    tagCache: 'dummy',
    queue: 'dummy',
  },
});
