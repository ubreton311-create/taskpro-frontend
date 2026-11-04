interface Service {
  id: string;
  name: string;
  description: string;
  price: number | string; // Corregido: antes decía basePrice
  category: string;
  isActive: boolean;
  providerId: string; // Agregado: necesario para la reserva
}