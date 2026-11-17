export type CitaEstado =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada"
  | "no_asistio";

export type MetodoPago = "efectivo" | "transferencia" | "tarjeta" | "otro";

export type TipoMovimiento = "ingreso" | "egreso";

export interface Cita {
  id: number;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  servicio: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm
  estado: CitaEstado;
  precio_acordado: number;
  duracion_min: number;
  notas?: string | null;
  created_at?: string;
}

export interface Servicio {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  duracion_min: number;
  precio: number;
  activo: boolean;
  orden: number;
}

export interface Finanza {
  id: number;
  tipo: TipoMovimiento;
  descripcion: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  categoria: string;
  metodo_pago: MetodoPago;
  cita_id?: number | null;
  created_at?: string;
}

export interface PortafolioItem {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string | null;
  imagen_url: string;
  created_at?: string;
}

export interface Clienta {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  notas: string;
  created_at?: string;
}

export interface NegocioConfig {
  id: number;
  nombre_salon: string;
  subtitulo: string;
  telefono_contacto: string;
  instagram: string;
  direccion: string;
  horario_apertura: string;
  horario_cierre: string;
  intervalo_min: number;
  dias_cerrados: number[];
  moneda: string;
}
