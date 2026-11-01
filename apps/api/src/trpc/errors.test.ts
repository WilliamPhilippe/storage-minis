import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  errorCategory,
  errorLimits,
  errorShape,
  publicError,
} from "./errors.js";

const secret = "HOSTILE_SECRET_SENTINEL";

function zodError(value: unknown, schema: z.ZodType) {
  const result = schema.safeParse(value);
  if (result.success) throw new Error("Expected a validation failure.");
  return result.error;
}

describe("tRPC error envelope", () => {
  it("returns fixed messages, numeric codes and statuses, never the error's text", () => {
    const cases: [TRPC_ERROR_CODE_KEY, number, string][] = [
      ["PARSE_ERROR", 400, "Invalid JSON"],
      ["BAD_REQUEST", 400, "Invalid request"],
      ["NOT_FOUND", 404, "Not found"],
      ["METHOD_NOT_SUPPORTED", 405, "Method not supported"],
      ["PAYLOAD_TOO_LARGE", 413, "Payload too large"],
      ["UNSUPPORTED_MEDIA_TYPE", 415, "Unsupported media type"],
      ["INTERNAL_SERVER_ERROR", 500, "Internal server error"],
    ];
    for (const [code, httpStatus, message] of cases) {
      const shape = errorShape(
        new TRPCError({ code, message: secret, cause: new Error(secret) }),
      );
      expect(shape).toEqual({
        message,
        code: TRPC_ERROR_CODES_BY_KEY[code],
        data: { code, httpStatus },
      });
      expect(JSON.stringify(shape)).not.toContain(secret);
    }
  });

  it("lists input-validation issues as path and code only, capped", () => {
    const schema = z.strictObject({
      message: z.string().min(1),
      items: z.array(z.number()),
    });
    const cause = zodError(
      { message: "", items: [`${secret}`], [secret]: secret },
      schema,
    );
    const shape = errorShape(new TRPCError({ code: "BAD_REQUEST", cause }));
    expect(shape.data).toEqual({
      code: "BAD_REQUEST",
      httpStatus: 400,
      issues: [
        { path: ["message"], code: "too_small" },
        { path: ["items", 0], code: "invalid_type" },
        { path: [], code: "unrecognized_keys" },
      ],
    });
    expect(JSON.stringify(shape)).not.toContain(secret);

    const many = zodError(
      Array.from({ length: errorLimits.issues + 5 }, () => "x"),
      z.array(z.number()),
    );
    const capped = errorShape(
      new TRPCError({ code: "BAD_REQUEST", cause: many }),
    );
    expect(capped.data.issues).toHaveLength(errorLimits.issues);
  });

  it("omits issues for output validation and other codes", () => {
    const cause = zodError(
      { message: 1 },
      z.strictObject({ message: z.string() }),
    );
    for (const code of ["INTERNAL_SERVER_ERROR", "NOT_FOUND"] as const) {
      expect(
        errorShape(new TRPCError({ code, cause })).data,
      ).not.toHaveProperty("issues");
    }
    expect(
      errorShape(
        new TRPCError({ code: "BAD_REQUEST", cause: new Error(secret) }),
      ).data,
    ).toEqual({ code: "BAD_REQUEST", httpStatus: 400 });
  });

  it("reports tRPC's wrapped query JSON failure as PARSE_ERROR", () => {
    const syntax = new SyntaxError(`Unexpected token in ${secret}`);
    const error = new TRPCError({ code: "BAD_REQUEST", cause: syntax });
    expect(publicError(error).code).toBe("PARSE_ERROR");
    expect(errorShape(error)).toEqual({
      message: "Invalid JSON",
      code: -32700,
      data: { code: "PARSE_ERROR", httpStatus: 400 },
    });
    expect(errorCategory(error)).toBe("parse_error");
    // Only BAD_REQUEST is remapped; a procedure's own SyntaxError stays a 500.
    const internal = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: syntax,
    });
    expect(publicError(internal)).toBe(internal);
  });

  it("names log categories after the code, with 500 as internal_error", () => {
    expect(errorCategory(new TRPCError({ code: "NOT_FOUND" }))).toBe(
      "not_found",
    );
    expect(errorCategory(new TRPCError({ code: "PAYLOAD_TOO_LARGE" }))).toBe(
      "payload_too_large",
    );
    expect(
      errorCategory(new TRPCError({ code: "INTERNAL_SERVER_ERROR" })),
    ).toBe("internal_error");
  });
});
