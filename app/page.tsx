
import { CoalBuyBurn } from "@/components/CoalBuyBurn"
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const embed = {
    "version": "1",
    "imageUrl": "https://www.ahumadores.cl/wp-content/uploads/ribs-bqq-costillar.jpg",
    "button": {
      "title": "AsaDAO", 
      "action": {
        "name": "Open AsaDAO",
        "type": "launch_frame",
        "url": "https://v0-asa-dao-a0-x-base-hackathon.vercel.app/"
      }
    }
  };

  return {
    // Claves personalizadas en <meta name="...">
    other: {
      "fc:miniapp": JSON.stringify(embed),
      // compatibilidad con clientes antiguos:
      "fc:frame": JSON.stringify(embed)
    }
  };
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">AsaDAO A0X</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Building the future of AsaDAO in Base - Hackathon Project
          </p>
          <div className="flex justify-center gap-4">
          <CoalBuyBurn />
          </div>
        </div>
      </div>
    </main>
  )
}
