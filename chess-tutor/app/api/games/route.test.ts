import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

afterEach(() => {
  delete process.env.IMPORTS_ENABLED;
});

describe("POST /api/games", () => {
  it("returns a disabled response when IMPORTS_ENABLED is false, without touching the request body", async () => {
    process.env.IMPORTS_ENABLED = "false";

    const request = new Request("http://localhost/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pgn: "1. e4 e5" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toMatch(/disabled/i);
  });
});
