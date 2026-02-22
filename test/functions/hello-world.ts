import { defineHttp } from "../../src/handlers/define-http";

export default defineHttp({
  method: "GET",
  path: "/hello",
  onRequest: async ({ req }) => ({
    status: 200,
    body: { message: "Hello World!!!", path: req.path }
  })
});
