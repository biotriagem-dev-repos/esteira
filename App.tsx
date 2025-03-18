import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, NativeModules } from 'react-native';

const { SerialPortModule } = NativeModules;

export default function App() {
  const [status, setStatus] = useState('');
  const [speed, setSpeed] = useState(0);

  const openPort = () => {
    // Abre a porta "COM3" com baud rate 9600 (ajuste conforme necessário)
    SerialPortModule.open('COM3', 9600)
      .then((msg: React.SetStateAction<string>) => setStatus(msg))
      .catch((err: string) => setStatus('Erro: ' + err));
  };

  const closePort = () => {
    SerialPortModule.close()
      .then((msg: React.SetStateAction<string>) => setStatus(msg))
      .catch((err: string) => setStatus('Erro: ' + err));
  };

  const sendSpeed = () => {
    // Envia o comando para ajustar a velocidade com base no estado "speed"
    SerialPortModule.setSpeed(speed)
      .then((msg: React.SetStateAction<string>) => setStatus(msg))
      .catch((err: string) => setStatus('Erro: ' + err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle da Esteira</Text>
      <Button title="Abrir Porta" onPress={openPort} />
      <Button title="Fechar Porta" onPress={closePort} />
      <Text style={styles.info}>Velocidade Atual: {speed}</Text>
      <View style={styles.buttonsRow}>
        <Button title="Aumentar" onPress={() => setSpeed(prev => Math.min(prev + 10, 169))} />
        <Button title="Diminuir" onPress={() => setSpeed(prev => Math.max(prev - 10, 0))} />
      </View>
      <Button title="Enviar Velocidade" onPress={sendSpeed} />
      <Text style={styles.status}>Status: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  info: { fontSize: 18, marginVertical: 10 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginVertical: 10 },
  status: { fontSize: 16, marginTop: 20 }
});
