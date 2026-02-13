Write all code, comments, commit messages, and documentation in English.

## Releases
- Release packages via changesets: add a `.changeset/<name>.md` file with the bump type and description.
- Do NOT edit `package.json` version directly.

## AWS SDK
- Always use the generated Effect wrappers from `src/aws/clients/` for AWS SDK calls. Never instantiate AWS SDK clients directly.
- For calls to a different region, use `Effect.provide()` with the corresponding client's `.Default({ region })` layer.
