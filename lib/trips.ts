export function fees(amount: number) {
  return Math.round(amount * 0.05);
}

export function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}