import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;
const PIE_COLORS = ['#1976D2', '#FF9800', '#4CAF50', '#9C27B0', '#E91E63', '#00BCD4'];

export default function ExploreScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = 'https://thermal-backlash-nutty.ngrok-free.dev/api';

  const fetchAnalytics = () => {
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
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Se calculează metricile și graficele...</Text>
      </SafeAreaView>
    );
  }

  const pieData = analytics?.allocation_chart?.map((item: any, index: number) => ({
    name: `% ${item.ticker}`,
    population: item.percentage,
    color: PIE_COLORS[index % PIE_COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  })) || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
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

            {analytics.history_chart && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Evoluția Randamentului (1 An - Bază 100)</Text>
                <LineChart
                  data={{
                    labels: analytics.history_chart.labels,
                    datasets: [{ data: analytics.history_chart.values }]
                  }}
                  width={screenWidth - 20}
                  height={200}
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#FFF',
                    backgroundGradientFrom: '#FFF',
                    backgroundGradientTo: '#FFF',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(85, 85, 85, ${opacity})`,
                    propsForDots: { r: '4', strokeWidth: '2', stroke: '#1976D2' }
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 12 }}
                />
              </View>
            )}

            {pieData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Distribuția Capitalului (% USD)</Text>
                <PieChart
                  data={pieData}
                  width={screenWidth - 20}
                  height={190}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="10"
                  absolute
                />
              </View>
            )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111', marginTop: 10 },
  headerSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  mainCard: { backgroundColor: '#1976D2', borderRadius: 12, padding: 20, marginBottom: 15, alignItems: 'center' },
  mainCardLabel: { color: '#E3F2FD', fontSize: 14, fontWeight: '600' },
  mainCardValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  chartCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', alignSelf: 'flex-start', marginBottom: 5 },
  gridContainer: { flexDirection: 'column', gap: 15 },
  metricCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  metricTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  metricValue: { fontSize: 22, fontWeight: 'bold', marginVertical: 6 },
  metricDesc: { fontSize: 12, color: '#777', lineHeight: 16 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 }
});