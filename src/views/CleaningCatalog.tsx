import { useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  X,
  Minus,
  Trash2,
  PackageCheck,
} from "lucide-react";

type Category =
  | "Limpiadores Líquidos y Químicos"
  | "Utensilios y Herramientas"
  | "Papel y Cuidado Personal";

type Product = {
  id: number;
  name: string;
  category: Category;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const categories: Category[] = [
  "Limpiadores Líquidos y Químicos",
  "Utensilios y Herramientas",
  "Papel y Cuidado Personal",
];

const products: Product[] = [
  // Limpiadores Líquidos y Químicos
  {
    id: 1,
    name: "Cloro",
    category: categories[0],
    price: 32,
    rating: 4.8,
    reviews: 128,
    image:
      "https://images.unsplash.com/photo-1603905179139-d8b3d6b7c5b5?auto=format&fit=crop&w=600&q=80",
    description: "Limpieza para superficies compatibles.",
  },
  {
    id: 2,
    name: "Detergente",
    category: categories[0],
    price: 58,
    rating: 4.9,
    reviews: 214,
    image:
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
    description: "Ideal para la limpieza diaria.",
  },
  {
    id: 3,
    name: "Suavizante",
    category: categories[0],
    price: 49,
    rating: 4.7,
    reviews: 96,
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
    description: "Cuidado y frescura para tus prendas.",
  },
  {
    id: 4,
    name: "Lavatrastes",
    category: categories[0],
    price: 35,
    rating: 4.8,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
    description: "Para lavar platos y utensilios de cocina.",
  },
  {
    id: 5,
    name: "Multiusos",
    category: categories[0],
    price: 42,
    rating: 4.6,
    reviews: 83,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80",
    description: "Limpieza práctica para diversas superficies.",
  },
  {
    id: 6,
    name: "Desengrasante",
    category: categories[0],
    price: 64,
    rating: 4.9,
    reviews: 142,
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80",
    description: "Para eliminar grasa en superficies compatibles.",
  },
  {
    id: 7,
    name: "Limpiavidrios",
    category: categories[0],
    price: 39,
    rating: 4.7,
    reviews: 77,
    image:
      "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=600&q=80",
    description: "Limpieza de cristales y ventanas.",
  },
  {
    id: 8,
    name: "Ácido muriático",
    category: categories[0],
    price: 55,
    rating: 4.6,
    reviews: 64,
    image:
      "https://images.unsplash.com/photo-1605600659873-d808a13e4d9a?auto=format&fit=crop&w=600&q=80",
    description: "Producto corrosivo para usos específicos.",
  },

  // Utensilios y Herramientas
  {
    id: 9,
    name: "Esponjas",
    category: categories[1],
    price: 25,
    rating: 4.8,
    reviews: 193,
    image:
      "https://images.unsplash.com/photo-1583947581924-a6d1a7b6b3f5?auto=format&fit=crop&w=600&q=80",
    description: "Para lavar utensilios y superficies.",
  },
  {
    id: 10,
    name: "Microfibra",
    category: categories[1],
    price: 39,
    rating: 4.9,
    reviews: 178,
    image:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
    description: "Paños reutilizables para limpieza cotidiana.",
  },
  {
    id: 11,
    name: "Escobas",
    category: categories[1],
    price: 89,
    rating: 4.7,
    reviews: 111,
    image:
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
    description: "Para barrer interiores y exteriores.",
  },
  {
    id: 12,
    name: "Trapeadores",
    category: categories[1],
    price: 99,
    rating: 4.8,
    reviews: 134,
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    description: "Para la limpieza de pisos.",
  },
  {
    id: 13,
    name: "Cubetas",
    category: categories[1],
    price: 65,
    rating: 4.6,
    reviews: 59,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80",
    description: "Accesorio práctico para tareas de limpieza.",
  },
  {
    id: 14,
    name: "Guantes",
    category: categories[1],
    price: 45,
    rating: 4.8,
    reviews: 101,
    image:
      "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80",
    description: "Protección para tareas de limpieza.",
  },
  {
    id: 15,
    name: "Atomizadores",
    category: categories[1],
    price: 29,
    rating: 4.7,
    reviews: 68,
    image:
      "https://images.unsplash.com/photo-1563207153-f403bf289096?auto=format&fit=crop&w=600&q=80",
    description: "Envases pulverizadores reutilizables.",
  },

  // Papel y Cuidado Personal
  {
    id: 16,
    name: "Papel higiénico",
    category: categories[2],
    price: 72,
    rating: 4.9,
    reviews: 246,
    image:
      "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80",
    description: "Artículo esencial para el hogar y negocio.",
  },
  {
    id: 17,
    name: "Toallas de papel",
    category: categories[2],
    price: 48,
    rating: 4.8,
    reviews: 139,
    image:
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
    description: "Para secado y limpieza de manos y superficies.",
  },
  {
    id: 18,
    name: "Jabón líquido",
    category: categories[2],
    price: 52,
    rating: 4.9,
    reviews: 167,
    image:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80",
    description: "Higiene de manos para uso diario.",
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(price);

function ProductImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`Imagen no disponible: ${alt}`}
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-yellow-50 text-[#7a2fbf]"
      >
        <Sparkles size={38} strokeWidth={1.5} />
        <span className="px-3 text-center text-xs font-semibold">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

export default function CleaningCatalog() {
  const [activeCategory, setActiveCategory] =
    useState<Category | "Todos">("Todos");

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("es-MX");

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const matchesSearch = [
        product.name,
        product.category,
        product.description,
      ].some((value) =>
        value.toLocaleLowerCase("es-MX").includes(normalizedSearch)
      );

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (
    productId: number,
    delta: number
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity + delta,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((current) =>
      current.filter(
        (item) => item.product.id !== productId
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f5fb] px-4 py-6 text-[#1a1a1a] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">

        {/* HERO BANNER */}
        <section className="relative isolate overflow-hidden rounded-[30px] bg-gradient-to-br from-[#42116f] via-[#60209b] to-[#7a2fbf] px-6 py-9 text-white shadow-xl shadow-purple-950/15 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[45px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-36 right-1/4 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-10 hidden h-48 w-48 rotate-12 rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:block" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#facc15] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#42116f] shadow-lg">
              <Sparkles size={15} />
              Catálogo de limpieza
            </span>

            <h1 className="mt-6 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Todo para una limpieza{" "}
              <span className="text-[#facc15]">
                impecable.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-purple-100 sm:text-base">
              Encuentra productos, herramientas y artículos
              de higiene para tu hogar o negocio en un solo lugar.
            </p>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/30 bg-white/95 p-2 shadow-2xl backdrop-blur-xl sm:flex-row"
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search
                  size={21}
                  className="shrink-0 text-[#7a2fbf]"
                />
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Busca cloro, detergente, guantes..."
                  aria-label="Buscar productos de limpieza"
                  className="w-full min-w-0 bg-transparent py-3 text-sm text-[#1a1a1a] outline-none placeholder:text-gray-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                    className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  >
                    <X size={17} />
                  </button>
                )}
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#facc15] px-7 py-3 font-extrabold text-[#1a1a1a] shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Buscar productos
                <Search size={18} />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/90">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-[#facc15]"
                />
                Productos seleccionados
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck
                  size={16}
                  className="text-[#facc15]"
                />
                Opciones para hogar y negocio
              </span>
            </div>
          </div>

          {/* FLOATING CART */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito, ${cartCount} productos`}
            className="absolute right-5 top-5 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#facc15] text-[#1a1a1a] shadow-xl shadow-purple-950/30 transition hover:scale-105 hover:bg-yellow-300 sm:right-8 sm:top-8"
          >
            <ShoppingCart size={24} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#42116f] bg-white px-1 text-xs font-black text-[#42116f]">
                {cartCount}
              </span>
            )}
          </button>
        </section>

        {/* CATEGORY FILTERS */}
        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Catálogo de productos
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Encuentra lo que necesitas y añádelo a tu carrito.
              </p>
            </div>

            <p className="text-sm font-semibold text-[#7a2fbf]">
              {filteredProducts.length} productos
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3">
            {(["Todos", ...categories] as const).map(
              (category) => {
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold transition duration-200 ${
                      active
                        ? "border-[#facc15] bg-[#facc15] text-[#1a1a1a] shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:text-[#7a2fbf]"
                    }`}
                  >
                    {category}
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/10"
              >
                {/* PRODUCT IMAGE */}
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-50 to-yellow-50">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                  />

                  <span className="absolute left-3 top-3 max-w-[85%] rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#7a2fbf] shadow-sm">
                    {product.category}
                  </span>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* PRODUCT DETAILS */}
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7a2fbf]">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-lg font-extrabold tracking-tight text-[#1a1a1a]">
                    {product.name}
                  </h3>

                  <p className="mt-1 min-h-10 text-sm leading-5 text-gray-500">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5">
                    <Star
                      size={15}
                      fill="#facc15"
                      className="text-yellow-500"
                    />
                    <span className="text-sm font-extrabold">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({product.reviews} reseñas)
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Precio
                      </p>
                      <p className="mt-0.5 text-2xl font-black tracking-tight text-[#42116f]">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      aria-label={`Añadir ${product.name} al carrito`}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#facc15] text-[#1a1a1a] shadow-md shadow-yellow-950/10 transition hover:scale-110 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2fbf]"
                    >
                      <Plus size={24} strokeWidth={2.7} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-purple-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#7a2fbf]">
              <Search size={28} />
            </div>
            <h3 className="mt-4 text-lg font-extrabold">
              No encontramos productos
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Prueba otra búsqueda o selecciona una categoría diferente.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("Todos");
              }}
              className="mt-5 rounded-xl bg-[#7a2fbf] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#42116f]"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* TRUST STRIP */}
        <section className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-purple-100 bg-white p-5 sm:grid-cols-3 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-100 p-3 text-[#42116f]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold">
                Compra con confianza
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Información clara de cada producto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-100 p-3 text-[#42116f]">
              <PackageCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold">
                Amplio catálogo
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Limpieza, herramientas e higiene.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-100 p-3 text-[#42116f]">
              <Truck size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold">
                Compra para tu negocio
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Productos para uso doméstico y comercial.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-[#1a1a1a]/50 backdrop-blur-sm"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2
                  id="cart-title"
                  className="text-xl font-black text-[#42116f]"
                >
                  Tu carrito
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {cartCount} artículos
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Cerrar"
                className="rounded-xl p-2 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-2xl bg-purple-50 p-5 text-[#7a2fbf]">
                    <ShoppingCart size={36} />
                  </div>
                  <h3 className="mt-4 font-extrabold">
                    Tu carrito está vacío
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Añade productos para comenzar tu compra.
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex gap-3 border-b border-gray-100 pb-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-purple-50">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-[#7a2fbf]">
                        {formatPrice(product.price)}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Reducir cantidad de ${product.name}`}
                          onClick={() =>
                            updateQuantity(product.id, -1)
                          }
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-4 text-center text-sm font-bold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Aumentar cantidad de ${product.name}`}
                          onClick={() => addToCart(product)}
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Eliminar ${product.name}`}
                          onClick={() =>
                            removeFromCart(product.id)
                          }
                          className="ml-auto rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-500">
                  Subtotal
                </span>
                <span className="text-2xl font-black text-[#42116f]">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Envío e impuestos se calculan al finalizar la compra.
              </p>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  // Conecta aquí el checkout de TaskPro.
                  console.info("Checkout", cart);
                }}
                className="mt-5 w-full rounded-xl bg-[#facc15] px-5 py-4 font-extrabold text-[#1a1a1a] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar al pago
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}