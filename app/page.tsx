import { CoalBuyBurn } from "@/components/CoalBuyBurn"
import Image from "next/image"
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const embed = {
    "version": "1",
    "imageUrl": "https://miniapp-asadao.vercel.app/MiniAsaDAO.jpg",
    "button": {
      "title": "AsaDAO", 
      "action": {
        "name": "Open AsaDAO",
        "type": "launch_frame",
        "url": "https://miniapp-asadao.vercel.app/"
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

export default function Page() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-lg mx-auto text-center space-y-6">
        <Image src="/LogoAsaDAO.png" alt="AsaDAO Logo" width={560} height={613} className="mx-auto"/>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Building the future of AsaDAO in Base - Hackathon Project
        </p>
        <p className="text-lg font-semibold text-center leading-relaxed">
            <span className="text-red-600 font-bold text-xl">⚠️ WARNING:</span>{" "}
            <span className="text-red-800">
              This platform is under development. The token available for purchase is not the final AsaDAO token.
            </span>
        </p>
        <CoalBuyBurn />
        <button
          className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-lg font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition"
        >
          Chat With AsaDAO Sensei
        </button>
      </div>
    </div>
  )
}