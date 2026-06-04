# Kiki Manicure 💅

Una aplicación web moderna y elegante para **Kiki Manicure**, un salón profesional especializado en uñas y cuidado personal. 

Esta plataforma permite a los clientes explorar los servicios ofrecidos, ver el portafolio de trabajos realizados y agendar citas de manera rápida y sencilla, enviando notificaciones automáticas vía WhatsApp.

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con herramientas modernas de desarrollo web para garantizar un rendimiento óptimo, código mantenible y una excelente experiencia de usuario:

- **[React](https://react.dev/)**: Biblioteca principal para la construcción de interfaces de usuario.
- **[Vite](https://vitejs.dev/)**: Entorno de desarrollo ultrarrápido y empaquetador moderno.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático para JavaScript, asegurando un código más robusto.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS basado en utilidades para un diseño rápido y responsivo.
- **[shadcn/ui](https://ui.shadcn.com/)**: Componentes de interfaz de usuario accesibles y personalizables.
- **[Supabase](https://supabase.com/)**: Base de datos (PostgreSQL) y backend as a service para el almacenamiento de datos.
- **CallMeBot API**: Integración para el envío automático de notificaciones de reservas por WhatsApp.

## 💻 Desarrollo Local

Si deseas clonar el proyecto para trabajar en él localmente, sigue estos pasos.

### Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (se recomienda la versión LTS) en tu computadora.

### Pasos de Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/PathFinder2408/kiki-manicure-.git
   ```

2. **Navega al directorio del proyecto:**
   ```bash
   cd kiki-manicure-
   ```

3. **Instala las dependencias:**
   ```bash
   npm install
   ```

4. **Configura las variables de entorno:**
   Crea un archivo llamado `.env` en la raíz del proyecto y agrega tus credenciales. *(Recuerda que este archivo no se sube a GitHub por seguridad)*:
   ```env
   VITE_SUPABASE_PROJECT_ID="tu_project_id"
   VITE_SUPABASE_PUBLISHABLE_KEY="tu_key"
   VITE_SUPABASE_URL="tu_url"
   
   VITE_CALLMEBOT_PHONE="+569..."
   VITE_CALLMEBOT_API_KEY="tu_api_key_de_callmebot"
   ```

5. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

6. ¡Listo! Abre [http://localhost:8080](http://localhost:8080) (o el puerto que te indique la terminal) en tu navegador para ver la página en vivo.

## 🌐 Despliegue

Este proyecto está configurado para ser desplegado fácilmente en plataformas como **Vercel**. Cualquier cambio empujado a la rama `main` en GitHub activará automáticamente una nueva construcción y actualización en línea.
