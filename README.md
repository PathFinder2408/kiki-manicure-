# Kiki Spa — Plataforma Full Stack de Agendamiento, CRM & Gestión Financiera ✨

Plataforma web y **PWA dual (App Clienta + App Dueña)** diseñada bajo arquitectura modular y enfoque **White-Label**, pensada para digitalizar por completo la operación de un salón de belleza, spa y estética.

Incluye motor de reservas en tiempo real, portal de clientas con **Google OAuth**, notificaciones seguras vía **Telegram** y **Correo**, blog dinámico de cosmetología/dermatología y un dashboard administrativo con monitoreo financiero, CRM con ficha clínica y control de caja mensual.

---

## 🚀 Arquitectura y Stack Tecnológico

* **Frontend:** React 18 · TypeScript · Vite (Code Splitting con `React.lazy` + `Suspense`)
* **UI / Diseño:** Tailwind CSS · `shadcn/ui` · Paleta *Nordic Warm Luxury* (*Warm Greige, Smoked Rose & Gold*) · Diseño responsive *mobile-first*
* **Estado y Formularios:** TanStack Query · React Hook Form · Zod (validación estricta)
* **Visualización de Datos:** Recharts (flujo de caja diario y métricas)
* **Backend & Base de Datos:** Supabase (PostgreSQL, Auth OAuth/OTP, Storage, Row Level Security, Triggers y funciones RPC)
* **Serverless API (Vercel):**
  * `/api/notify-whatsapp`: envío seguro desde servidor de alertas de citas por **Telegram Bot API**, **Resend Email** y **CallMeBot** sin exponer credenciales en el navegador.
  * `/api/beauty-news`: lector RSS público de actualidad en dermatología, skincare y spa con caché en Edge.
* **Calidad & CI/CD:** Vitest (pruebas unitarias de lógica de negocio) · GitHub Actions (`.github/workflows/ci.yml`) · Vercel

---

## 🧩 Módulos Implementados

### 1. Experiencia para Clientas (`/` · `/agendar` · `/mi-agenda` · `/blog`)
* **Motor de Agendamiento Inteligente (`/agendar`):**
  * Flujo guiado en 4 pasos con catálogo y precios cargados dinámicamente desde Supabase.
  * Cálculo de disponibilidad en tiempo real (`src/lib/availability.ts`) con soporte para **doble bloque horario diario** (mañana y tarde) y bloqueo de *double-booking* a nivel de PostgreSQL.
  * Exportación directa de la cita a **Google Calendar** y archivo **`.ics`** con recordatorio automático.
* **Portal de Clientas (`/mi-agenda`):**
  * Acceso sencillo con **Google OAuth** o **Enlace Mágico** por correo.
  * Consulta segura de citas propias vía RPC (`get_my_appointments`) y evaluación del servicio (1–5 ⭐).
* **Blog de Cosmetología, Spa & Dermatología (`/blog`):**
  * Artículos administrables desde `/admin` combinados con noticias públicas automáticas (`/api/beauty-news`).
* **Loaders Contextuales (`SalonLoader.tsx`):** Transiciones animadas temáticas según el contexto de carga (app, horarios, servicios, blog, ficha).

### 2. Panel de Gestión y Finanzas (`/admin`)
* **Resumen Ejecutivo:** KPIs mensuales en tiempo real (Ingresos, Egresos, Balance Neto, Margen % y Ticket Promedio) + gráfico de flujo de caja diario y desglose por método de pago.
* **Agenda Mensual Compacta:** Navegación por mes (`MonthSelector`), agrupación colapsable por estado (*Pendientes/Confirmadas*, *Realizadas*, *Canceladas*) y cobro en 1 clic (`CobrarCitaModal`) que registra el ingreso automáticamente en caja.
* **Finanzas por Mes:** Registro de ingresos/egresos con método de pago y exportación a **CSV** compatible con Excel.
* **CRM de Clientas + Ficha Clínica:** Auto-registro automático mediante Trigger SQL al agendar una cita nueva, CRUD completo y **memoria personal de atenciones** (servicios entregados, tonos/productos usados y observaciones).
* **Catálogo, Blog & Configuración White-Label:** Edición de servicios, galería de portafolio, publicación de artículos y horarios personalizados por cada día de la semana (mañana y tarde).

### 3. Dos PWAs Instalables Independientes
* **App Clienta (`Kiki Spa`):** `public/manifest.webmanifest` apuntando a `/agendar` con navegación inferior móvil (`MobileBottomNav`).
* **App Dueña (`Kiki Admin`):** `public/admin-manifest.webmanifest` apuntando a `/admin` con ícono corporativo adaptado.

---

## 🧪 Pruebas y Verificación

```bash
# Chequeo estático de TypeScript
npm run typecheck

# Pruebas unitarias (motor de disponibilidad y analítica financiera)
npm test

# Build de producción
npm run build
```

---

## 💻 Instalación Local

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/PathFinder2408/kiki-manicure-.git
   cd kiki-manicure-
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Copia `.env.example` a `.env` y completa tus credenciales (públicas `VITE_SUPABASE_*` para el cliente y privadas para las Serverless Functions en Vercel):
   ```env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-public-key"

   TELEGRAM_BOT_TOKEN="tu-token"
   TELEGRAM_CHAT_ID="tu-chat-id"
   RESEND_API_KEY="re_tu_api_key"
   ADMIN_EMAIL="tu-correo@ejemplo.com"
   ```

4. **Ejecuta las migraciones SQL en Supabase:**
   En el **SQL Editor** de tu proyecto Supabase, ejecuta en orden los scripts de `supabase/migrations/`.

5. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
