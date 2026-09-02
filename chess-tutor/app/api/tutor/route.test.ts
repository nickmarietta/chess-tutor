import { afterEach, describe, expect, it, vi } from "vitest";

const { listMoveAnalyses, explainMove } = vi.hoisted(() => ({
  listMoveAnalyses: vi.fn(),
  explainMove: vi.fn(),
}));

vi.mock("@/lib/supabase/analysis", () => ({ listMoveAnalyses }));
vi.mock("@/lib/tutor/explainMove", () => ({ explainMove }));

const { POST } = await import("./route");

afterEach(() => {
  delete process.env.AI_ENABLED;
  vi.clearAllMocks();
});

function postRequest(body: unknown) {
  return new Request("http://localhost/api/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function* fakeStream(...chunks: string[]) {
  for (const chunk of chunks) yield chunk;
}

describe("POST /api/tutor", () => {
  it("returns a disabled response when AI_ENABLED is false", async () => {
    process.env.AI_ENABLED = "false";

    const response = await POST(postRequest({ gameId: "g1", positionId: "p1", helpMode: "answer" }));

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toMatch(/disabled/i);
    expect(listMoveAnalyses).not.toHaveBeenCalled();
  });

  it("rejects an invalid helpMode", async () => {
    const response = await POST(
      postRequest({ gameId: "g1", positionId: "p1", helpMode: "nonsense" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns a 500 JSON error when loading move analyses fails, matching the other routes", async () => {
    listMoveAnalyses.mockRejectedValue(new Error("Supabase is down"));

    const response = await POST(
      postRequest({ gameId: "g1", positionId: "p1", helpMode: "answer" }),
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Supabase is down");
  });

  it("returns 404 when no analysis exists for the position", async () => {
    listMoveAnalyses.mockResolvedValue([]);

    const response = await POST(
      postRequest({ gameId: "g1", positionId: "missing", helpMode: "answer" }),
    );

    expect(response.status).toBe(404);
  });

  it("streams the explanation for a valid request", async () => {
    listMoveAnalyses.mockResolvedValue([{ position_id: "p1" }]);
    explainMove.mockReturnValue(fakeStream("Ng6 is a blunder.", "The engine preferred Nd7."));

    const response = await POST(
      postRequest({ gameId: "g1", positionId: "p1", helpMode: "answer" }),
    );

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("Ng6 is a blunder. The engine preferred Nd7.");
  });
});
