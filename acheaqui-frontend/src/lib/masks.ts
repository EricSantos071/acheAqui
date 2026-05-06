// ── src/lib/masks.ts ──────────────────────────────────────────────────────────
// Input mask formatters — call these in onChange handlers

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")                    // remove non-digits
    .slice(0, 11)                          // max 11 digits
    .replace(/(\d{3})(\d)/, "$1.$2")       // 000.
    .replace(/(\d{3})(\d)/, "$1.$2")       // 000.000.
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // 000.000.000-00
}

export function maskCNPJ(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}