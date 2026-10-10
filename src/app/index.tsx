import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Portfolio {
  id: number;
  name: string;
  description: string;
  target_allocation: Record<string, number>; // modif ca acm primesc json
}

export default function App() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    fetch('http://192.168.1.167:8000/api/portfolios/')
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
    marginBottom: 10,
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
    marginTop: 5,
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
  }
});