export interface Env {
  ASSETS: Fetcher;
  BACKEND_ORIGIN: string;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. PRIORITY MATCH: Check for backend proxy endpoints first
    if (
      pathname.startsWith("/api") || 
      pathname.startsWith("/oauth2") || 
      pathname.startsWith("/logout")
    ) {
      const targetUrl = new URL(pathname + url.search, env.BACKEND_ORIGIN);
      const modifiedRequest = new Request(targetUrl.toString(), request);
      
      try {
        return await fetch(modifiedRequest);
      } catch (error) {
        console.error("Backend Proxy Error:", error);
        
        // Return a clean JSON error if it's an API route
        if (pathname.startsWith("/api")) {
          return Response.json(
            { error: "Backend service temporarily unavailable" }, 
            { status: 503 }
          );
        }
        
        // Fallback response for failed OAuth/Logout redirects
        return new Response("Authentication server is offline. Please try again later.", { status: 503 });
      }
    }

    // 2. FALLBACK: Serve static assets
    let response = await env.ASSETS.fetch(request);
  
    // 3. SPA MANUAL HANDLING: If asset isn't a real file (404), serve index.html instead
    if (response.status === 404) {
      const indexUrl = new URL("/index.html", request.url);
      response = await env.ASSETS.fetch(indexUrl);
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
