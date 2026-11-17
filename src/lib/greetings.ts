const MINDFUL_PHRASES = [
  "Hoy es un gran día para crear con calma y propósito.",
  "Respira profundo; tu tranquilidad se refleja en cada detalle.",
  "Un paso a la vez, todo fluye a tu ritmo.",
  "Tu espacio, tu ritmo, tu mejor energía.",
  "Regálate un momento de pausa entre cada atención.",
];

export function resolveDisplayName(
  email?: string | null,
  fullName?: string | null
): string {
  if (fullName && fullName.trim()) {
    const first = fullName.trim().split(/\s+/)[0];
    return capitalize(first);
  }
  if (!email) return "";
  const local = email.split("@")[0].toLowerCase();
  if (local.startsWith("francis")) return "Francisco";
  if (local.startsWith("kiki")) return "Kiki";
  const clean = local.replace(/[0-9._-]+/g, " ").trim().split(/\s+/)[0];
  return clean ? capitalize(clean) : "";
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function getMindfulMessage(): string {
  const dayIndex = new Date().getDate() % MINDFUL_PHRASES.length;
  return MINDFUL_PHRASES[dayIndex];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
