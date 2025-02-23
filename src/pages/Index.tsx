
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/database";
import { toast } from "sonner";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  const features = [
    {
      title: "Fresh & Organic",
      description: "Hand-picked fresh produce from local farmers",
    },
    {
      title: "Fast Delivery",
      description: "Same day delivery for your convenience",
    },
    {
      title: "Best Prices",
      description: "Competitive prices for premium quality",
    },
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(3);

        if (error) {
          throw error;
        }

        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Failed to load featured products");
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto animate-fadeIn">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6">
              Fresh From Farm To Your Table
            </h1>
            <p className="text-text-light text-lg mb-8">
              Discover nature's finest selection of fresh fruits and vegetables,
              delivered right to your doorstep.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-secondary">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 text-center animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="font-heading text-xl font-semibold text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="font-heading text-3xl font-bold text-text text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-lg font-semibold text-text">
                    {product.name}
                  </h3>
                  <p className="text-primary-dark font-semibold">
                    ${product.price.toFixed(2)}
                    <span className="text-text-light text-sm ml-1">
                      per {product.unit}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
