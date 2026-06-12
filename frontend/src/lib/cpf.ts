// Validacao oficial de CPF (algoritmo dos digitos verificadores). Aceita o CPF com ou sem mascara. Rejeita formatos invalidos e sequencias repetidas (000.000.000-00, 111.111.111-11, ...) que satisfazem o algoritmo mas nao sao CPFs reais.

export function isValidCPF(input: string): boolean {
  const digits = (input ?? '').replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calc = (slice: string, weightStart: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += Number(slice[i]) * (weightStart - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calc(digits.slice(0, 9), 10);
  if (d1 !== Number(digits[9])) return false;
  const d2 = calc(digits.slice(0, 10), 11);
  if (d2 !== Number(digits[10])) return false;
  return true;
}
