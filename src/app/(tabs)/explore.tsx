import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';

export default function ExploreScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = 'https://thermal-backlash-nutty.ngrok-free.dev/api';

  const fetchAnalytics = () => {
    setLoading(true);
    fetch(`${API_BASE}/portfolios/1/analytics/`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Se calculează metricile de risc...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.headerTitle}>Analiză Avansată & Risc</Text>
      <Text style={styles.headerSubtitle}>Indicatori bazați pe date istorice (Markowitz & Sharpe)</Text>

      {analytics && analytics.total_value_usd > 0 ? (
        <>
          <View style={styles.mainCard}>
            <Text style={styles.mainCardLabel}>Valoare Evaluată Portofoliu</Text>
            <Text style={styles.mainCardValue}>{analytics.total_value_usd} USD</Text>
          </View>

          <View style={styles.gridContainer}>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Sharpe Ratio</Text>
              <Text style={[styles.metricValue, { color: analytics.sharpe_ratio >= 1 ? '#2E7D32' : '#D32F2F' }]}>
                {analytics.sharpe_ratio}
              </Text>
              <Text style={styles.metricDesc}>Eficiența randamentului ajustat la risc (&gt; 1 este bun).</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Volatilitate Anuală</Text>
              <Text style={styles.metricValue}>{analytics.volatility}%</Text>
              <Text style={styles.metricDesc}>Gradul de oscilație a prețurilor în ultimele 12 luni.</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Maximum Drawdown</Text>
              <Text style={[styles.metricValue, { color: '#C62828' }]}>{analytics.max_drawdown}%</Text>
              <Text style={styles.metricDesc}>Cea mai mare pierdere istorică de la vârf la fund.</Text>
            </View>

          </View>
        </>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nu există suficiente date sau active pentru analiză.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111', marginTop: 10 },
  headerSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  mainCard: { backgroundColor: '#1976D2', borderRadius: 12, padding: 20, marginBottom: 20, alignItems: 'center' },
  mainCardLabel: { color: '#E3F2FD', fontSize: 14, fontWeight: '600' },
  mainCardValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  gridContainer: { flexDirection: 'column', gap: 15, paddingBottom: 30 },
  metricCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  metricTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  metricValue: { fontSize: 22, fontWeight: 'bold', marginVertical: 6 },
  metricDesc: { fontSize: 12, color: '#777', lineHeight: 16 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 }
});