import { describe, expect, it, vi } from "vitest";
import { sharedRequest } from "@/lib/api";

describe("sharedRequest", () => {
  it("ne fait qu'un seul appel quand plusieurs composants demandent la même donnée", async () => {
    const load = vi.fn().mockResolvedValue(["A", "B"]);
    const get = sharedRequest(load);

    const [first, second] = await Promise.all([get(), get()]);

    expect(load).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("réessaie au prochain appel après un échec", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("réseau")).mockResolvedValue(["A"]);
    const get = sharedRequest(load);

    await expect(get()).rejects.toThrow("réseau");
    await expect(get()).resolves.toEqual(["A"]);
    expect(load).toHaveBeenCalledTimes(2);
  });
});
