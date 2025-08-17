import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';

export default function OfferScreen() {
  const router = useRouter();
  
  const params = useLocalSearchParams<{
    cleanerId?: string;
    cleanerName?: string;
  }>();

  const cleanerId = params.cleanerId || '';
  const cleanerName = params.cleanerName || 'Bilinmeyen Temizlikçi';

  const [price, setPrice] = React.useState('');

  const handleSubmit = () => {
    if (!price) {
      alert('Lütfen teklif fiyatını girin.');
      return;
      
    }
    alert(`${cleanerName} için ${price}₺ teklif gönderildi`);
    setPrice('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {cleanerName} ({cleanerId}) için teklif gönder
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Teklif fiyatı (₺)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Button title="Gönder" onPress={handleSubmit} />
      <Button title="Geri Dön" onPress={() => router.back()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    marginBottom: 20,
    borderRadius: 5,
  },
});
