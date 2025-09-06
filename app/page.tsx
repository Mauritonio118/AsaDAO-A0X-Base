
import { Wallet } from "@coinbase/onchainkit/wallet"

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
          <Wallet />
          </div>
        </div>
      </div>
    </main>
  )
}
