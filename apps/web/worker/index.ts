export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env): Promise<Response> {
    let response = await env.ASSETS.fetch(request);

    if (response.status === 404) {
      const indexUrl = new URL("/index.html", request.url);
      response = await env.ASSETS.fetch(indexUrl);
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
