import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChairHeroScroll } from "@/components/hero/ChairHeroScroll";
import { EditorialFurnitureSection } from "@/components/home/EditorialFurnitureSection";
import { ProductDetailSection } from "@/components/product/ProductDetailSection";
import { AtelierStatementSection } from "@/components/atelier/AtelierStatementSection";
import { CollectionSection } from "@/components/collections/CollectionSection";
import { ChairCustomisationSection } from "@/components/customisation/ChairCustomisationSection";
import { ChairScene } from "@/components/three/ChairScene";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastNotification } from "@/components/cart/ToastNotification";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F4ED] text-[#191817]">
      {/* Shared Persistent 3D Chair Presentation Layer */}
      <ChairScene />

      {/* Interactive Cart and Toast Notification Layers */}
      <CartDrawer />
      <ToastNotification />

      {/* Scandinavian Modern Luxury Navigation */}
      <Navbar />

      <main className="relative flex-1 flex flex-col">
        {/* Cinematic Scroll-Driven Exploded Armchair Hero */}
        <ChairHeroScroll />

        {/* Editorial Typography & 3D Showcase Section */}
        <EditorialFurnitureSection />

        {/* Archival Product Detail Section with Seamless 3D Chair Destination */}
        <ProductDetailSection />

        {/* Atelier Statement & Craft Section */}
        <AtelierStatementSection />

        {/* Collections Section with Product Cards */}
        <CollectionSection />

        {/* Premium 3D Chair Colour Customisation Section */}
        <ChairCustomisationSection />
      </main>

      {/* Atmospheric Architectural Footer */}
      <Footer />
    </div>
  );
}
