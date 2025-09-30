import dynamic from 'next/dynamic';

// Critical components loaded immediately
import HeroSection from "@/components/LandingPage/HeroSection";
import SearchByCategory from "@/components/LandingPage/SearchByCategory";

// Non-critical components loaded lazily
const FeaturedListings = dynamic(() => import("@/components/LandingPage/FeaturedListings"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-3xl" />
});

const FindOpportunities = dynamic(() => import("@/components/LandingPage/FindOpportunities"), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-3xl" />
});

const HowItWorks = dynamic(() => import("@/components/LandingPage/HowItWorks"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-3xl" />
});

const Testimonials = dynamic(() => import("@/components/LandingPage/Testimonials"), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-3xl" />
});

const WishlistForm = dynamic(() => import("@/components/LandingPage/WishlistForm"), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-3xl" />
});


export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf7ed] flex flex-col items-center w-full">
      <HeroSection />
      <SearchByCategory />
      <FindOpportunities />
      <FeaturedListings />
      <HowItWorks />
      <Testimonials />
      <WishlistForm />
      <div className="h-10"></div>
      <a
        href="/feedback"
        className="text-sm font-semibold tracking-wide underline underline-offset-4 text-transparent bg-clip-text bg-gradient-to-r from-[#02afa5] via-[#5B3DF6] to-[#755FF5] hover:brightness-125 hover:scale-105 transition-all duration-200 ease-in-out"
      >
        Feedback?
      </a>
      <div className="h-10"></div>
    </div>
  );
}
