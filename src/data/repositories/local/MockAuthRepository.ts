import { LocalAuthRepository } from "@/data/repositories/local/LocalAuthRepository";

/**
 * Explicit mock-auth name used by repository selection.
 * LocalAuthRepository remains exported for backwards compatibility.
 */
export class MockAuthRepository extends LocalAuthRepository {}
