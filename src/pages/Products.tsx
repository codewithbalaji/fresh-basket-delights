import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/database";
import { toast } from "sonner";
import {
  Grid2x2,
  List,
  Search,
  Eye,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 1000]); // Increased range
  const [sortBy, setSortBy] = useState<string>("name-asc");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setProducts(data || []);
        setFilteredProducts(data || []);
        
        // Set initial price range based on actual product prices
        if (data && data.length > 0) {
          const prices = data.map(p => p.price);
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([0, maxPrice]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products whenever filters change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...products];

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );
      }

      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter(product =>
          product.category_id === selectedCategory
        );
      }

      // Apply price range filter
      filtered = filtered.filter(product =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name-desc':
            return b.name.localeCompare(a.name);
          default: // name-asc
            return a.name.localeCompare(b.name);
        }
      });

      setFilteredProducts(filtered);
    };

    // Debounce the filter application
    const debouncedFilter = debounce(applyFilters, 300);
    debouncedFilter();

    // Cleanup
    return () => {
      debouncedFilter.cancel();
    };
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={() => setQuickViewProduct(product)}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-[300px] object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-text mb-2">
                    {product.name}
                  </h2>
                  <p className="text-text-light mb-4">
                    {product.description}
                  </p>
                  <p className="text-2xl font-bold text-primary-dark mb-4">
                    ${product.price.toFixed(2)}
                    <span className="text-text-light text-sm ml-1">
                      per {product.unit}
                    </span>
                  </p>
                  <button
                    className="w-full px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                    onClick={() => toast.success("Added to cart")}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <button
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
            onClick={() => toast.success("Added to cart")}
          >
            <ShoppingCart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h2 className="font-heading text-lg font-semibold text-text hover:text-primary transition-colors">
            {product.name}
          </h2>
        </Link>
        <p className="text-text-light line-clamp-2 text-sm mb-2">
          {product.description}
        </p>
        <p className="text-primary-dark font-semibold">
          ${product.price.toFixed(2)}
          <span className="text-text-light text-sm ml-1">
            per {product.unit}
          </span>
        </p>
      </div>
    </div>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <div className="flex gap-4 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative w-48 h-32">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-1">
        <Link to={`/products/${product.id}`}>
          <h2 className="font-heading text-lg font-semibold text-text hover:text-primary transition-colors">
            {product.name}
          </h2>
        </Link>
        <p className="text-text-light text-sm mb-2">
          {product.description}
        </p>
        <p className="text-primary-dark font-semibold">
          ${product.price.toFixed(2)}
          <span className="text-text-light text-sm ml-1">
            per {product.unit}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <button
              onClick={() => setQuickViewProduct(product)}
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-[300px] object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-text mb-2">
                  {product.name}
                </h2>
                <p className="text-text-light mb-4">
                  {product.description}
                </p>
                <p className="text-2xl font-bold text-primary-dark mb-4">
                  ${product.price.toFixed(2)}
                  <span className="text-text-light text-sm ml-1">
                    per {product.unit}
                  </span>
                </p>
                <button
                  className="w-full px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                  onClick={() => toast.success("Added to cart")}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <button
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
          onClick={() => toast.success("Added to cart")}
        >
          <ShoppingCart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="font-heading text-3xl font-bold text-text">
            Our Products
          </h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGridView(true)}
                className={`p-2 rounded ${isGridView ? 'bg-primary text-white' : 'bg-white'}`}
              >
                <Grid2x2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsGridView(false)}
                className={`p-2 rounded ${!isGridView ? 'bg-primary text-white' : 'bg-white'}`}
              >
                <List className="w-5 h-5" />
              </button>

              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 bg-white rounded">
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Category
                      </label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="organic">Organic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Price Range (${priceRange[0]} - ${priceRange[1]})
                      </label>
                      <Slider
                        defaultValue={priceRange}
                        max={1000}
                        step={1}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                          <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                          <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-light">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-light">No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            {isGridView ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
