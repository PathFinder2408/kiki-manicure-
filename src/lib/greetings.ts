export const ADMIN_EMAILS = [
  "francissaant@gmail.com",
  "kikimanicurista@gmail.com",
];

const MINDFUL_PHRASES = [
  "Hoy es un gran día para crear con calma y propósito.",
  "Respira profundo; tu tranquilidad se refleja en cada detalle.",
  "Un paso a la vez, todo fluye a tu ritmo.",
  "Tu espacio, tu ritmo, tu mejor energía.",
  "Regálate un momento de pausa entre cada atención.",
  "Lo que haces con cariño siempre vuelve multiplicado.",
  "Hoy elige la serenidad por encima de la prisa.",
  "Cada detalle que cuidas habla de tu dedicación.",
  "Confía en tu proceso; estás construyendo algo hermoso.",
  "Tu bienestar también es prioridad hoy.",
  "Sonríe: hoy es una nueva oportunidad para brillar.",
  "Mantén la calma en tu mente y la magia en tus manos.",
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

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
  const idx = Math.floor(Math.random() * MINDFUL_PHRASES.length);
  return MINDFUL_PHRASES[idx];
}

const FAREWELL_PHRASES = [
  "¡Hasta pronto! Sigue brillando con tu luz propia ✨",
  "Que tu día sea tan radiante y hermoso como tú 🌸",
  "Cuida tu belleza y tu paz interior hoy y siempre 💫",
  "Gracias por compartir tu tiempo; el mejor brillo es tu sonrisa ✨",
  "Lleva contigo la calma y elegancia de Kiki Spa 🌿",
];

export function getFarewellMessage(): string {
  const idx = Math.floor(Math.random() * FAREWELL_PHRASES.length);
  return FAREWELL_PHRASES[idx];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
