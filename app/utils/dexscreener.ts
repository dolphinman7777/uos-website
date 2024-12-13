export interface TokenInfo {
  price: number;
  marketCap: number;
  liquidity: number;
  symbol?: string;
  name?: string;
  isUOS?: boolean;
}

export interface PairInfo {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  volume24h: number;
  txns24h: {
    buys: number;
    sells: number;
  };
}

const DEX_API_BASE = 'https://api.dexscreener.com/latest';
const UOS_TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || '';

export async function getTokenPrice(address: string): Promise<TokenInfo | null> {
  try {
    console.log('Fetching price for:', address);
    const response = await fetch(`${DEX_API_BASE}/dex/tokens/${address}`);
    
    if (!response.ok) {
      console.error('DEXScreener API error:', response.status);
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('DEXScreener response:', data);
    
    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    // Get the first pair (usually the most liquid one)
    const pair = data.pairs[0];
    
    return {
      price: parseFloat(pair.priceUsd) || 0,
      marketCap: pair.marketCap || 0,
      liquidity: pair.liquidity?.usd || 0,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      isUOS: address === UOS_TOKEN_ADDRESS
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

export async function getTokenPairs(address: string): Promise<PairInfo[]> {
  try {
    const response = await fetch(`${DEX_API_BASE}/dex/tokens/${address}`);
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If this is UOS token, prioritize its pairs
    if (address === UOS_TOKEN_ADDRESS) {
      return data.pairs?.sort((a: PairInfo, b: PairInfo) => 
        (b.volume24h || 0) - (a.volume24h || 0)
      ) || [];
    }
    
    return data.pairs || [];
  } catch (error) {
    console.error('Error fetching token pairs:', error);
    return [];
  }
} 