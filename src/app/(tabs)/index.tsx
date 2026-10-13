import { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface AssetDetails {
  id: number;
  name: string;
  ticker: string;
  asset_type: string;
  currency: string;
}

interface PortfolioPosition {
  id: number;
  quantity: string;
  purchase_price: string;
  asset_details: AssetDetails;
  current_price: number | null;
  profit_loss: number | null;
  current_price_usd: number | null; 
  purchase_price_usd: number | null;
}

interface Portfolio {
  id: number;
  name: string;
  description: string;
  target_allocation: Record<string, number>;
  positions: PortfolioPosition[];
}

export default function App() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [refreshing, setRefreshing] = useState(false); 

  const loadPortfolios = () => {
    fetch('https://thermal-backlash-nutty.ngrok-free.dev/api/portfolios/')
      .then((response) => response.json())
      .then((data: Portfolio[]) => setPortfolios(data))
      .catch((error) => console.error("Eroare la fetch:", error))
      .finally(() => setRefreshing(false)); 
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true); 
    loadPortfolios();    
  }, []);

  const calculatePortfolioStats = (positions: PortfolioPosition[]) => {
    let totalInvested = 0;
    let currentValue = 0;

    positions.forEach(pos => {
      const qty = parseFloat(pos.quantity);
      
      const buyPriceUsd = pos.purchase_price_usd || 0;
      const marketPriceUsd = pos.current_price_usd ? pos.current_price_usd : buyPriceUsd;

      totalInvested += qty * buyPriceUsd;
      currentValue += qty * marketPriceUsd;
    });

    const profitAbsolute = currentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? (profitAbsolute / totalInvested) * 100 : 0;

    return {
      currentValue: currentValue.toFixed(2),
      profitAbsolute: profitAbsolute.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
      isPositive: profitAbsolute >= 0
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Portofoliile mele</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/add-transaction')}
        >
          <Text style={styles.addButtonText}>+ Adaugă</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={portfolios}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const stats = item.positions && item.positions.length > 0 
            ? calculatePortfolioStats(item.positions) 
            : null;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.portfolioName}>{item.name}</Text>
                {stats && (
                  <View style={styles.macroStats}>
                    <Text style={styles.totalValueText}>{stats.currentValue} USD</Text>
                    <Text style={[styles.totalProfitText, { color: stats.isPositive ? '#4CAF50' : '#F44336' }]}>
                      {stats.isPositive ? '▲ +' : '▼ '}{stats.profitAbsolute} USD ({stats.profitPercentage}%)
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.portfolioDesc}>{item.description}</Text>
              
              <View style={styles.allocationBadge}>
                <Text style={styles.allocationTitle}>Alocare țintă:</Text>
                {item.target_allocation && Object.entries(item.target_allocation).map(([key, value]) => (
                  <Text key={key} style={styles.allocationText}>
                    • {key}: {value}%
                  </Text>
                ))}
              </View>

              {item.positions && item.positions.length > 0 && (
                <View style={styles.positionsContainer}>
                  <Text style={styles.positionsTitle}>Dețineri actuale:</Text>
                  {item.positions.map((pos) => (
                    <View key={pos.id} style={styles.positionRow}>
                      <View style={styles.assetInfoSection}>
                        <Text style={styles.positionName}>{pos.asset_details.name} ({pos.asset_details.ticker})</Text>
                        <Text style={styles.positionPrice}>
                          Achiziție: {pos.purchase_price ? `${pos.purchase_price} ${pos.asset_details.currency}` : 'N/A'}
                        </Text>
                        <Text style={styles.positionPrice}>
                          Piață: {pos.current_price ? `${pos.current_price} ${pos.asset_details.currency}` : 'Indisponibil'}
                        </Text>
                      </View>
                      
                      <View style={styles.metricsSection}>
                        <View style={styles.quantityBadge}>
                          <Text style={styles.quantityText}>{parseFloat(pos.quantity).toString()} buc.</Text>
                        </View>
                        {pos.profit_loss !== null && (
                          <Text style={[styles.profitText, { color: pos.profit_loss >= 0 ? '#4CAF50' : '#F44336' }]}>
                            {pos.profit_loss >= 0 ? '▲ ' : '▼ '}{Math.abs(pos.profit_loss)}%
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  portfolioName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  portfolioDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 12,
  },
  allocationBadge: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  allocationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 6,
  },
  allocationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
    marginBottom: 2,
  },
  positionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  positionsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  positionPrice: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  quantityBadge: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  assetInfoSection: {
    flex: 1,
  },
  metricsSection: {
    alignItems: 'flex-end',
  },
  profitText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  macroStats: {
    alignItems: 'flex-end',
  },
  totalValueText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
  },
  totalProfitText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
});