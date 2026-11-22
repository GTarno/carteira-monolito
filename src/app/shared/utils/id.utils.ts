/**
 * Gera um identificador único para registros criados no navegador (enquanto não há API).
 * Usa `crypto.randomUUID` quando disponível (contexto seguro) e um fallback aleatório caso contrário.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
