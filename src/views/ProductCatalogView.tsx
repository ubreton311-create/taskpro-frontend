import { useState } from "react";
import { ShoppingCart, Star, Plus, Search, ShieldCheck, Tag, Sparkles, Filter } from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
};

const products: Product[] = [
  {
    id: "p1",
    name: "Limpiador Multiusos Concentrado",
    category: "Químicos",
    price: 120,
    rating: 4.9,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1585844434636-63d49e51555c?auto=format&fit=crop&w=600&q=80",
    badge: "Más Vendido",
  },
  {
    id: "p2",
    name: "Desinfectante en Aerosol (Pack 3)",
    category: "Químicos",
    price: 185,
    rating: 4.8,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p3",
    name: "Trapeador de Microfibra Premium",
    category: "Herramientas",
    price: 250,
    rating: 4.7,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1584820927498-cafe3c157154?auto=format&fit=crop&w=600&q=80",
    badge: "Nuevo",
  },
  {
    id: "p4",
    name: "Kit de Guantes de Hule Reforzados",
    category: "Accesorios",
    price: 85,
    rating: 4.6,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p5",
    name: "Jabón Líquido para Manos (1 Galón)",
    category: "Químicos",
    price: 160,
    rating: 4.9,
    reviews: 410,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p6",
    name: "Cepillo de Cerda Dura para Baño",
    category: "Herramientas",
    price: 65,
    rating: 4.5,
    reviews: 82,
    image: "https://images.unsplash.com/photo-1585839216400-6b736bbad12b?auto=format&fit=crop&w=600&q=80",
  },
];

const categories = ["Todos", "Químicos", "Herramientas", "Accesorios"];

export default function ProductCatalogView() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<string[]>([]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(price);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (id: string) => {
    setCart((prev) => [...prev, id]);
    // Aquí puedes agregar un Toast o alerta visual
  };

  return (
    <main className="min-h-screen bg-[#f7f5fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        
        {/* HEADER DEL CATÁLOGO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#42116f] to-[#7a2fbf] px-8 py-10 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-extrabold uppercase text-[#1a1a1a]">
              <Sparkles size={14} /> Tienda TaskPro
            </span>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              Productos de Limpieza Profesional
            </h1>
            <p className="mt-2 text-sm text-purple-100 sm:text-base">
              Calidad de expertos directo a tu hogar. Compra los mismos insumos que nuestros técnicos utilizan.
            </p>

            <div className="mt-6 flex max-w-md items-center gap-3 rounded-xl bg-white/95 p-2 shadow-lg backdrop-blur-md">
              <Search size={20} className="ml-2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-2 text-sm text-[#1a1a1a] outline-none placeholder:text-gray-500"
              />
              <button className="rounded-lg bg-[#facc15] px-4 py-2 text-sm font-bold text-[#1a1a1a] hover:bg-yellow-300">
                Buscar
              </button>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border-[40px] border-white/10" />
        </section>

        {/* FILTROS Y CONTADOR DEL CARRITO */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#7a2fbf] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat === "Todos" && <Filter size={16} />}
                {cat}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-gray-800">
            <ShoppingCart size={18} />
            Carrito ({cart.length})
          </button>
        </section>

        {/* GRID DE PRODUCTOS */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-lg bg-[#facc15] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#1a1a1a] shadow-sm">
                    {product.badge}
                  </span>
                )}
                <div className="absolute bottom-4 right-4 rounded-xl bg-white/90 p-2 backdrop-blur-md">
                  <ShieldCheck size={18} className="text-[#7a2fbf]" />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {product.category}
                </p>
                <h3 className="mt-1 text-lg font-black leading-tight text-[#1a1a1a]">
                  {product.name}
                </h3>
                
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <Star size={15} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-[#1a1a1a]">{product.rating}</span>
                  <span>({product.reviews} reseñas)</span>
                </div>

                <div className="mt-auto flex items-end justify-between pt-5">
                  <div>
                    <p className="text-xs text-gray-500">Precio</p>
                    <p className="text-xl font-black text-[#1a1a1a]">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#facc15] text-[#1a1a1a] shadow-sm transition hover:scale-110 hover:bg-yellow-300"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Tag size={48} className="mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-bold text-[#1a1a1a]">No encontramos productos</h3>
            <p className="mt-1 text-sm text-gray-500">Intenta con otra categoría o término de búsqueda.</p>
          </div>
        )}

      </div>
    </main>
  );
}