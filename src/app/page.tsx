import Hero from "@/components/Hero";
import About from "@/components/About";
import Amenities from "@/components/Amenities";
import Rooms from "@/components/Rooms";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <div className="space-y-20">
      <Hero />
      <About />
      <Amenities />
      <Rooms />
      <Gallery />
      <Location />
      <Testimonials />
      <Contact />
    </div>
  );
}
