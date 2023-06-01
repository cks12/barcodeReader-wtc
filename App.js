import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Audio } from 'expo-av';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcodes, setBarcodes] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async({ type, data }) => {
    setScanned(true);
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/sounds/barcodereader.wav')
    );
    await sound.playAsync();

    if(barcodes.includes(data)) return alert("Item já adicionado");

    setBarcodes([...barcodes, data]);
  };

  const handleSend = () => {
    const formattedNumber = encodeURIComponent(whatsappNumber);
    const message = encodeURIComponent(barcodes.join('\n'));
    Linking.openURL(`whatsapp://send?phone=${formattedNumber}&text=${message}`);
  };

  const deleteBarcode = (index) => {
    const updatedBarcodes = [...barcodes];
    updatedBarcodes.splice(index, 1);
    setBarcodes(updatedBarcodes);
  };

  const handleDelete = () => {
    setBarcodes([]);
  }

  if (hasPermission === null) {
    return <Text style={styles.loadingText}>Solicitando permissão de câmera...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.loadingText}>Acesso à câmera negado!</Text>;
  }

  return (
    <ScrollView>

    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{width:"100%",height:400}}
        />

      <Text style={styles.title}>Leitor de Códigos de Barras</Text>

    <TouchableOpacity style={styles.button} onPress={handleSend} disabled={barcodes.length === 0}>
        <Text style={styles.buttonText}>Enviar via WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, {backgroundColor:"red"}]} onPress={handleDelete} disabled={barcodes.length === 0}>
        <Text style={styles.buttonText}>Apagar tudo</Text>
      </TouchableOpacity>

      <ScrollView style={styles.barcodesContainer}>
        <Text style={styles.barcodesTitle}>Códigos de Barras Lidos:</Text>
        {barcodes.map((barcode, index) => (
          <View key={index} style={styles.barcodeItem}>
            <Text style={styles.barcodeText}>{barcode}</Text>
            <TouchableOpacity onPress={() => deleteBarcode(index)}>
              <MaterialIcons name="delete" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Escanear novamente</Text>
        </TouchableOpacity>
      )}
    </View>
</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight + 20,
    backgroundColor: '#FFF',
    paddingHorizontal:10
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
  },
  barcodesContainer: {
    width: '80%',
    maxHeight: 200,
    padding: 10,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderRadius: 9
  },
  barcodesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  barcodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  barcodeText: {
    flex: 1,
    marginRight: 10,
  },
});
