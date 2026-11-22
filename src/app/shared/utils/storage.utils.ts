/**
 * Leitura/escrita de JSON no localStorage, sem lançar erro (modo privado, cota cheia, JSON inválido).
 * Enquanto não há API, é assim que os dados criados pelo usuário sobrevivem a um recarregamento.
 */
export function readJson<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : null;
  } catch {
    return null;
  }
}

/** Retorna `false` se não foi possível salvar (ex.: armazenamento cheio). */
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
