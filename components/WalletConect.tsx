import { Wallet } from '@coinbase/onchainkit/wallet';

export function WalletConnect() {
  return (
    <Wallet
      className="bg-[#7b82f0] text-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200 hover:bg-[#a4a9f5]"
    />
  );
}
