import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

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
}

interface Portfolio {
  id: number;
  name: string;
  description: string;
  target_allocation: Record<string, number>;
  positions: PortfolioPosition[];
}

export default function App() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    fetch('https://thermal-backlash-nutty.ngrok-free.dev/api/portfolios/')
      .then((response) => response.json())
      .then((data: Portfolio[]) => setPortfolios(data))
      .catch((error) => console.error("Eroare la fetch:", error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portofoliile mele</Text>
      
      <FlatList
        data={portfolios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.portfolioName}>{item.name}</Text>
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
                    <View>
                      <Text style={styles.positionName}>{pos.asset_details.name} ({pos.asset_details.ticker})</Text>
                      <Text style={styles.positionPrice}>
                        Preț achiziție: {pos.purchase_price ? `${pos.purchase_price} ${pos.asset_details.currency}` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>{parseFloat(pos.quantity).toString()} buc.</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
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
    marginBottom: 20,
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
  }
});