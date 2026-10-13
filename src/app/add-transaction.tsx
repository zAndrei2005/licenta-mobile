import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function AddTransaction() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const API_BASE = 'https://thermal-backlash-nutty.ngrok-free.dev/api'; 

  useEffect(() => {
    fetch(`${API_BASE}/portfolios/`)
      .then(res => {
        if (!res.ok) throw new Error('Eroare server la portofolii');
        return res.json();
      })
      .then(data => {
        setPortfolios(data);
        if (data.length > 0) setSelectedPortfolio(data[0].id.toString());
      })
      .catch(err => {
        console.error("Eroare portofolii:", err);
        Alert.alert('Eroare Conexiune', 'Nu s-au putut încărca datele. Verifică dacă Ngrok și Django rulează.');
      });

    fetch(`${API_BASE}/assets/`)
      .then(res => {
        if (!res.ok) throw new Error('Eroare server la active');
        return res.json();
      })
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
      quantity: parseFloat(quantity),
      purchase_price: parseFloat(price)
    };

    fetch(`${API_BASE}/positions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(res => {
      if (res.ok) {
        Alert.alert('Succes', 'Tranzacția a fost salvată!');
        router.back(); 
      } else {
        Alert.alert('Eroare', 'A apărut o problemă la salvare.');
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>   
        <View style={styles.container}>
        <Text style={styles.label}>Alege Portofoliul</Text>
        <View style={styles.pickerContainer}>
            <Picker
            selectedValue={selectedPortfolio}
            onValueChange={(itemValue) => setSelectedPortfolio(itemValue)}
            itemStyle={{ height: 150, fontSize: 16, color: '#000000' }}>
            {portfolios.map(p => <Picker.Item key={p.id} label={p.name} value={p.id.toString()} />)}
            </Picker>
        </View>

        <Text style={styles.label}>Alege Activul</Text>
        <View style={styles.pickerContainer}>
            <Picker
            selectedValue={selectedAsset}
            onValueChange={(itemValue) => setSelectedAsset(itemValue)}
            itemStyle={{ height: 150, fontSize: 16, color: '#000000' }}>
            {assets.map(a => <Picker.Item key={a.id} label={`${a.name} (${a.ticker})`} value={a.id.toString()} />)}
            </Picker>
        </View>

        <Text style={styles.label}>Cantitate</Text>
        <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Ex: 2.5"
        />

        <Text style={styles.label}>Preț Achiziție (per bucată)</Text>
        <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholder="Ex: 450.50"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvează Tranzacția</Text>
        </TouchableOpacity>
        </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  pickerContainer: { 
    backgroundColor: '#FFF', 
    borderRadius: 8, 
    marginBottom: 15,
    height: 150, 
    justifyContent: 'center'
  },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  saveButton: { backgroundColor: '#1976D2', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});