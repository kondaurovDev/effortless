import { defineHttp } from "../../src/handlers/define-http";
import { defineTable } from "../../src/handlers/define-table";
import { param } from "../../src/handlers/param";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";

// ── Shared table (used as dep) ───────────────────────────────

type Session = { sid: string; userId: string; expiresAt: number };

export const sessions = defineTable<Session>({
  pk: { name: "sid", type: "string" },
  ttlAttribute: "expiresAt",
});

// ── GET /hello (with params) ─────────────────────────────────

export const hello = defineHttp({
  name: "api-hello",
  method: "GET",
  path: "/hello",
  params: {
    greeting: param("greeting-text"),
  },
  onRequest: async ({ req, params }) => ({
    status: 200,
    body: { message: params.greeting, path: req.path }
  })
});

// ── POST /user (with schema + deps + params + context) ───────

const UserSchema = S.Struct({
  name: S.String,
  age: S.Number
});

const decodeUser = (input: unknown) =>
  pipe(
    S.decodeUnknown(UserSchema)(input),
    Effect.map(user => ({
      greeting: `Hello ${user.name}, you are ${user.age} years old!`,
      isAdult: user.age >= 18
    })),
    Effect.catchAll(() => Effect.succeed({
      greeting: "Invalid user data",
      isAdult: false
    })),
    Effect.runSync
  );

export const user = defineHttp({
  name: "api-user",
  method: "POST",
  path: "/user",
  deps: { sessions },
  params: {
    maxAge: param("session-max-age", Number),
  },
  context: ({ params }) => ({
    sessionTtl: params.maxAge * 60,
  }),
  schema: (input) => decodeUser(input),
  onRequest: async ({ data, deps, params, ctx }) => {
    // deps.sessions is TableClient<Session>
    // params.maxAge is number
    // ctx.sessionTtl is number
    // data is { greeting: string; isAdult: boolean }
    void deps.sessions;
    void params.maxAge;
    void ctx.sessionTtl;
    return {
      status: 200,
      body: data
    };
  }
});
