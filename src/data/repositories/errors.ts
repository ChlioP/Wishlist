export type RepositoryErrorCode =
  | "conflict"
  | "forbidden"
  | "not_found"
  | "unauthenticated"
  | "validation";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, message: string) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
  }
}
