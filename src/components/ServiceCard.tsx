import { useState } from "react";
import {
  ArrowRight,
  Star,
  HeartPulse,
  Flower2,
  Sparkles,
  Wrench,
  Hammer,
  Paintbrush,
  House,
  UserRound,
  Activity,
  WashingMachine,
  HardHat,
  Ruler,
  PanelsTopLeft,
  Zap,
  type LucideIcon,
} from "lucide-react";
import "./ServiceCard.css";

export interface Service {
  id: string;
  name: string; // <-- Tu backend envía 'name', no 'title'
  description: string;
  price: number | string;
  category: string;
  providerId: string;

  // Datos opcionales del proveedor (se irán llenando cuando el backend los envíe)
  providerName?: string;
  providerAvatar?: string;
  providerRating?: number;
  totalTrips?: number;
  yearsOnPlatform?: number;
}

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

interface CategoryTheme {
  icon: LucideIcon;
  subtitle: string;
  className: string;
}

// Mapeamos por el NOMBRE del servicio para que sea preciso
function getCategoryTheme(name: string): CategoryTheme {
  const n = name.toLowerCase();

  if (n.includes("enfermer") || n.includes("cuidado")) 
    return { icon: HeartPulse, subtitle: "Cuidado Personal - Enfermería", className: "health" };
  if (n.includes("jardin")) 
    return { icon: Flower2, subtitle: "Hogar y Exterior - Jardinería", className: "garden" };
  if (n.includes("limpieza") || n.includes("planchado")) 
    return { icon: Sparkles, subtitle: "Hogar - Limpieza Profesional", className: "cleaning" };
  if (n.includes("electric") || n.includes("electrónic")) 
    return { icon: Zap, subtitle: "Mantenimiento - Electricidad", className: "electricity" };
  if (n.includes("plomer")) 
    return { icon: Wrench, subtitle: "Mantenimiento - Plomería", className: "plumbing" };
  if (n.includes("pintura") || n.includes("impermeabil")) 
    return { icon: Paintbrush, subtitle: "Remodelación - Pintura", className: "painting" };
  if (n.includes("a/c") || n.includes("aire")) 
    return { icon: Activity, subtitle: "Mantenimiento - A/C", className: "ac" };
  if (n.includes("línea blanca") || n.includes("lavadora")) 
    return { icon: WashingMachine, subtitle: "Hogar - Línea Blanca", className: "appliances" };
  if (n.includes("albañil") || n.includes("albanil")) 
    return { icon: HardHat, subtitle: "Construcción - Albañilería", className: "masonry" };
  if (n.includes("carpinter")) 
    return { icon: Ruler, subtitle: "Remodelación - Carpintería", className: "carpentry" };
  if (n.includes("vidrier")) 
    return { icon: PanelsTopLeft, subtitle: "Hogar - Vidriería", className: "glass" };
  if (n.includes("reparacion") || n.includes("herrer")) 
    return { icon: Hammer, subtitle: "Mantenimiento - Reparaciones", className: "repairs" };

  return { icon: House, subtitle: "Servicios Profesionales", className: "default" };
}

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const {
    name,
    description,
    price,
    providerName = "Proveedor TaskPro",
    providerAvatar,
    providerRating,
    totalTrips,
    yearsOnPlatform,
  } = service;

  const [avatarError, setAvatarError] = useState(false);

  const theme = getCategoryTheme(name);
  const CategoryIcon = theme.icon;
  const showAvatar = Boolean(providerAvatar) && !avatarError;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));

  const formattedYears = yearsOnPlatform === undefined ? null : Number.isInteger(yearsOnPlatform)
    ? yearsOnPlatform.toString()
    : yearsOnPlatform.toFixed(1);

  return (
    <article className={`service-card service-card--${theme.className}`}>
      {/* HEADER: Categoría e identidad visual */}
      <header className="service-card__header">
        <div className="service-card__category-icon">
          <CategoryIcon size={30} strokeWidth={1.8} />
        </div>
        <div className="service-card__category-info">
          <span className="service-card__category-name">
            {service.category.toUpperCase()}
          </span>
          <span className="service-card__category-subtitle">
            {theme.subtitle}
          </span>
        </div>
      </header>

      {/* PERFIL DEL PROVEEDOR */}
      <section className="service-card__provider">
        <div className="service-card__avatar" aria-label={`Proveedor: ${providerName}`}>
          {showAvatar ? (
            <img
              src={providerAvatar}
              alt={`Fotografía de ${providerName}`}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span>{getInitials(providerName) || <UserRound size={25} />}</span>
          )}
        </div>

        {providerRating !== undefined && (
          <div className="service-card__reputation">
            <div className="service-card__rating-number">
              <strong>{providerRating.toFixed(1)}</strong>
              <Star size={19} fill="#f5b82e" color="#f5b82e" aria-hidden="true" />
            </div>
          </div>
        )}
      </section>

      <div className="service-card__provider-name">{providerName}</div>

      {/* ESTADÍSTICAS DEL PROVEEDOR */}
      <section className="service-card__stats">
        <ul>
          {totalTrips !== undefined && <li>
            <span className="service-card__bullet" />
            <span><strong>Viajes:</strong> {totalTrips.toLocaleString("en-US")}</span>
          </li>}
          <li>
            <span className="service-card__bullet" />
            <span><strong>Top categorías:</strong> {service.category}</span>
          </li>
          {formattedYears !== null && <li>
            <span className="service-card__bullet" />
            <span><strong>En TaskPro:</strong> {formattedYears} Años</span>
          </li>}
        </ul>
      </section>

      {/* INFORMACIÓN DEL SERVICIO */}
      <section className="service-card__details">
        <h3 className="service-card__title">{name}</h3>
        <p className="service-card__description">
          {description || "Servicio profesional a domicilio."}
        </p>
      </section>

      {/* FOOTER: PRECIO Y RESERVA */}
      <footer className="service-card__footer">
        <div className="service-card__price">
          <span>Precio</span>
          <strong>{formattedPrice}</strong>
        </div>
        <button
          type="button"
          className="service-card__button"
          onClick={() => onBook(service)}
          aria-label={`Reservar ${name}`}
        >
          Reservar
          <ArrowRight size={17} strokeWidth={2.3} />
        </button>
      </footer>

    </article>
  );
}