import React, { useState } from 'react';
import { TokenPerformance, TrustScoreDatabase } from '../types/trust';
import { Line } from 'react-chartjs-2';
import Image from 'next/image';
import styles from './TokenAnalysis.module.css';

export default function TokenAnalysis() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tokenData, setTokenData] = useState<TokenPerformance | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch data from both DexScreener and Trust Engine
      const [dexData, trustData, priceData] = await Promise.all([
        fetch(`/api/dexscreener/${searchQuery}`),
        fetch(`/api/trust/${searchQuery}`),
        fetch(`/api/price-history/${searchQuery}`)
      ]);

      const [dexJson, trustJson, priceJson] = await Promise.all([
        dexData.json(),
        trustData.json(),
        priceData.json()
      ]);

      setPriceHistory(priceJson.prices);
      setTokenData({
        ...dexJson,
        ...trustJson,
      });
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: priceHistory.map((_, i) => i),
    datasets: [
      {
        label: 'Price History',
        data: priceHistory,
        borderColor: '#3B82F7',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#fff'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#fff'
        }
      }
    }
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className={styles.unifiedButton}
      >
        <div className={styles.buttonInner}>
          <div className={styles.buttonLeft}>
            <span className={styles.icon}>📊</span>
            <div className={styles.buttonText}>
              <h3>Live trading data</h3>
              <p>View real-time UOS market information</p>
            </div>
          </div>
          <div className={styles.buttonRight}>
            <span className={styles.icon}>🔒</span>
            <div className={styles.buttonText}>
              <h3>Trust Analysis</h3>
              <p>View trust scores and metrics</p>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Token Analysis</h2>
          <button 
            onClick={() => setIsExpanded(false)}
            className={styles.closeButton}
          >
            ×
          </button>
        </div>

        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter token address or name..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              Analyze
            </button>
          </form>
        </div>

        {loading && <div className={styles.loader}>Loading analysis...</div>}

        {tokenData && (
          <div className={styles.content}>
            <div className={styles.chartSection}>
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className={styles.resultsGrid}>
              <div className={styles.priceCard}>
                <h3>Market Data</h3>
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <span>Price:</span>
                    <span>${tokenData.priceChange24h}</span>
                  </div>
                  <div className={styles.metric}>
                    <span>24h Volume:</span>
                    <span>${tokenData.volumeChange24h.toLocaleString()}</span>
                  </div>
                  <div className={styles.metric}>
                    <span>Liquidity:</span>
                    <span>${tokenData.liquidity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className={styles.trustCard}>
                <h3>Trust Analysis</h3>
                <div className={styles.trustScore}>
                  <div className={styles.scoreCircle} style={{
                    background: `conic-gradient(#3B82F7 ${tokenData.validationTrust * 3.6}deg, #2B3244 0deg)`
                  }}>
                    <span>{tokenData.validationTrust.toFixed(1)}</span>
                  </div>
                </div>
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <span>Risk Level:</span>
                    <span className={tokenData.rugPull ? styles.high : styles.low}>
                      {tokenData.rugPull ? 'HIGH RISK' : 'LOW RISK'}
                    </span>
                  </div>
                  <div className={styles.metric}>
                    <span>24h Holder Change:</span>
                    <span className={tokenData.holderChange24h > 0 ? styles.positive : styles.negative}>
                      {tokenData.holderChange24h > 0 ? '+' : ''}{tokenData.holderChange24h}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 