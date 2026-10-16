import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function AddTransaction() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const API_BASE = 'https://thermal-backlash-nutty.ngrok-free.dev/api';

  useEffect(() => {
    fetch(`${API_BASE}/portfolios/`)
      .then(res => res.json())
      .then(data => {
        setPortfolios(data);
        if (data.length > 0) setSelectedPortfolio(data[0].id.toString());
      })
      .catch(err => console.error("Eroare portofolii:", err));

    fetch(`${API_BASE}/assets/`)
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        if (data.length > 0) setSelectedAsset(data[0].id.toString());
      })
      .catch(err => console.error("Eroare active:", err));
  }, []);

  const handleSave = () => {
    if (!quantity || !price) {
      Alert.alert('Atenție', 'Te rog introdu cantitatea și prețul.');
      return;
    }

    const payload = {
      portfolio: parseInt(selectedPortfolio),
      asset: parseInt(selectedAsset),
      quantity: parseFloat(quantity.replace(',', '.')),
      purchase_price: parseFloat(price.replace(',', '.')),
      transaction_type: transactionType
    };

    fetch(`${API_BASE}/positions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        if (transactionType === 'SELL') {
          Alert.alert(
            'Vânzare Executată (FIFO)',
            `Profit marcat: ${data.last_realized_profit}\nImpozit estimat (10%): ${data.last_estimated_tax}`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          Alert.alert('Succes', 'Achiziția a fost înregistrată!', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      } else {
        const errorMsg = data.detail || 'A apărut o problemă la procesarea tranzacției.';
        Alert.alert('Operațiune Respinsă', errorMsg);
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, transactionType === 'BUY' && styles.buyActive]}
            onPress={() => setTransactionType('BUY')}
          >
            <Text style={[styles.typeText, transactionType === 'BUY' && styles.activeTypeText]}>
              Cumpără (BUY)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, transactionType === 'SELL' && styles.sellActive]}
            onPress={() => setTransactionType('SELL')}
          >
            <Text style={[styles.typeText, transactionType === 'SELL' && styles.activeTypeText]}>
              Vinde (SELL)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Alege Portofoliul</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPortfolio}
            onValueChange={(itemValue) => setSelectedPortfolio(itemValue)}
            itemStyle={{ height: 130, fontSize: 16, color: '#000000' }}>
            {portfolios.map(p => (
              <Picker.Item key={p.id} label={p.name} value={p.id.toString()} color="#000000" />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Alege Activul</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedAsset}
            onValueChange={(itemValue) => setSelectedAsset(itemValue)}
            itemStyle={{ height: 130, fontSize: 16, color: '#000000' }}>
            {assets.map(a => (
              <Picker.Item key={a.id} label={`${a.name} (${a.ticker})`} value={a.id.toString()} color="#000000" />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Cantitate</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Ex: 0.5"
        />

        <Text style={styles.label}>
          {transactionType === 'BUY' ? 'Preț Achiziție (per bucată)' : 'Preț Vânzare (per bucată)'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          placeholder="Ex: 120.50"
        />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: transactionType === 'BUY' ? '#1976D2' : '#D32F2F' }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {transactionType === 'BUY' ? 'Salvează Achiziția' : 'Execută Vânzarea'}
          </Text>
        </TouchableOpacity>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  typeSelector: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#E0E0E0', borderRadius: 8, padding: 4 },
  typeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  buyActive: { backgroundColor: '#1976D2' },
  sellActive: { backgroundColor: '#D32F2F' },
  typeText: { fontSize: 15, fontWeight: 'bold', color: '#555' },
  activeTypeText: { color: '#FFF' },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  pickerContainer: { backgroundColor: '#FFF', borderRadius: 8, marginBottom: 12, height: 130, justifyContent: 'center' },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 12 },
  saveButton: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  saveButtonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' }
});