import Image from "next/image";
import Link from "next/link";
import { ICONS, IMAGES } from "@/assets/images/config";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Dashboard Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Main Title */}
        <div className="text-center mb-12">
          <Image
            src={ICONS.WELCOME_TEXT}
            alt="Welcome to your class Reward Dashboard"
            width={1000}
            height={500}
            className="mx-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* Start Button */}
        <div className="mb-8">
          <Link href="/auth">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-12 rounded-full text-2xl md:text-3xl shadow-lg border-2 border-yellow-600 border-dashed transform hover:scale-105 transition-all duration-200">
              start
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
