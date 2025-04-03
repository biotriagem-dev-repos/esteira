import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  useSerialPortModule,
  RGBColors,
  OperationMode,
  RGBColor,
} from '../types/SerialPortModuleTypes';
import Slider from '@react-native-community/slider';

// Interfaces para tipos de eventos
interface TemperatureEvent {
  Value: number;
}

interface PressureEvent {
  Value: number;
}

interface ErrorEvent {
  Message: string;
}

interface ColorButtonProps {
  color: RGBColor;
  onPress: () => void;
  title: string;
}

const SerialControlExample: React.FC = () => {
  const serialPort = useSerialPortModule();

  // Estados para controlar os valores da UI
  const [isConnected, setIsConnected] = useState(false);
  const [portName, setPortName] = useState('COM1');
  const [baudRate, setBaudRate] = useState('115200');
  const [temperature, setTemperature] = useState('37.0');
  const [pressure, setPressure] = useState('1013.2');
  const [treadmillSpeed, setTreadmillSpeed] = useState(0);
  const [treadmillIncline, setTreadmillIncline] = useState(0);
  const [operationMode, setOperationMode] = useState(OperationMode.AUTOMATIC);
  const [heaterPower, setHeaterPower] = useState(0);
  const [pumpPower, setPumpPower] = useState(0);
  const [lampOn, setLampOn] = useState(false);
  const [ledsOn, setLedsOn] = useState(false);
  const [neonOn, setNeonOn] = useState(false);

  // Estados para armazenar os valores recebidos
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [currentPressure, setCurrentPressure] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cores RGB atuais
  const [rgbExternal, setRgbExternal] = useState(RGBColors.RED);
  const [rgbInternal, setRgbInternal] = useState(RGBColors.BLUE);

  // Configura os event listeners quando o componente é montado
  useEffect(() => {
    if (!isConnected) {
      return; // Não configura listeners se não estiver conectado
    }

    // Adiciona listeners para eventos do módulo serial
    const tempListener = serialPort.addListener(
      'temperatureReceived',
      (event: TemperatureEvent) => {
        setCurrentTemp(event.Value);
        setErrorMessage(null);
      },
    );

    const pressureListener = serialPort.addListener(
      'pressureReceived',
      (event: PressureEvent) => {
        setCurrentPressure(event.Value);
        setErrorMessage(null);
      },
    );

    const errorListener = serialPort.addListener(
      'serialError',
      (event: ErrorEvent) => {
        setErrorMessage(event.Message);
        console.error('Serial error:', event.Message);
      },
    );

    // Configura um timer para solicitar a temperatura e pressão a cada 5 segundos quando conectado
    const interval = setInterval(() => {
      if (isConnected) {
        requestTemperatureAndPressure();
      }
    }, 5000);

    // Limpa os listeners quando o componente é desmontado
    return () => {
      tempListener.remove();
      pressureListener.remove();
      errorListener.remove();
      clearInterval(interval);
    };
  }, [isConnected]);

  // Funções para comunicação serial
  const connectToPort = async () => {
    try {
      await serialPort.open(portName, parseInt(baudRate, 10));
      setIsConnected(true);
      setErrorMessage(null);
      // Solicita os valores atuais
      requestTemperatureAndPressure();
    } catch (error: any) {
      setErrorMessage(error.message);
      Alert.alert('Erro de Conexão', error.message);
    }
  };

  const disconnectFromPort = async () => {
    try {
      await serialPort.close();
      setIsConnected(false);
      setCurrentTemp(null);
      setCurrentPressure(null);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error.message);
      Alert.alert('Erro ao Desconectar', error.message);
    }
  };

  const requestTemperatureAndPressure = async () => {
    if (isConnected) {
      try {
        await serialPort.requestTemperature();
        await serialPort.requestPressure();
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    }
  };

  // Funções para controlar os diversos parâmetros
  const setTempSetpoint = async () => {
    if (isConnected) {
      try {
        await serialPort.setTemperature(parseFloat(temperature));
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      Alert.alert('Erro', 'Porto serial não está conectado');
    }
  };

  const setPressureSetpoint = async () => {
    if (isConnected) {
      try {
        await serialPort.setPressure(parseFloat(pressure));
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      Alert.alert('Erro', 'Porto serial não está conectado');
    }
  };

  const handleSpeedChange = async (value: number) => {
    setTreadmillSpeed(value);
    if (isConnected) {
      try {
        await serialPort.setSpeed(value);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    }
  };

  const handleInclineChange = async (value: number) => {
    setTreadmillIncline(value);
    if (isConnected) {
      try {
        await serialPort.setIncline(value);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    }
  };

  const toggleOperationMode = async () => {
    const newMode =
      operationMode === OperationMode.AUTOMATIC
        ? OperationMode.MANUAL
        : OperationMode.AUTOMATIC;

    if (isConnected) {
      try {
        await serialPort.setOperationMode(newMode);
        setOperationMode(newMode);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      setOperationMode(newMode); // Atualiza no estado local mesmo se não estiver conectado
    }
  };

  const handleHeaterPowerChange = async (value: number) => {
    setHeaterPower(value);
    if (isConnected && operationMode === OperationMode.MANUAL) {
      try {
        await serialPort.setHeaterPower(value);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    }
  };

  const handlePumpPowerChange = async (value: number) => {
    setPumpPower(value);
    if (isConnected && operationMode === OperationMode.MANUAL) {
      try {
        await serialPort.setPumpPower(value);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    }
  };

  const toggleLamp = async () => {
    const newState = !lampOn;
    if (isConnected) {
      try {
        await serialPort.setLamp(newState);
        setLampOn(newState);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      setLampOn(newState); // Atualiza no estado local mesmo se não estiver conectado
    }
  };

  const toggleLeds = async () => {
    const newState = !ledsOn;
    if (isConnected) {
      try {
        await serialPort.setLeds(newState);
        setLedsOn(newState);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      setLedsOn(newState);
    }
  };

  const toggleNeon = async () => {
    const newState = !neonOn;
    if (isConnected) {
      try {
        await serialPort.setNeon(newState);
        setNeonOn(newState);
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      setNeonOn(newState);
    }
  };

  const activateAroma = async () => {
    if (isConnected) {
      try {
        await serialPort.activateAroma();
        setErrorMessage(null);
        // Feedback visual para o usuário
        Alert.alert('Aromatizador', 'Pulso de aromatizador ativado');
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      Alert.alert('Erro', 'Porto serial não está conectado');
    }
  };

  const setRgbColors = async () => {
    if (isConnected) {
      try {
        await serialPort.setRgbColor(
          rgbExternal.r,
          rgbExternal.g,
          rgbExternal.b,
          rgbInternal.r,
          rgbInternal.g,
          rgbInternal.b,
        );
        setErrorMessage(null);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      Alert.alert('Erro', 'Porto serial não está conectado');
    }
  };

  const ColorButton = ({color, onPress, title}: ColorButtonProps) => (
    <TouchableOpacity
      style={[
        styles.colorButton,
        {backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`},
      ]}
      onPress={onPress}>
      <Text
        style={[
          styles.colorButtonText,
          {color: color.r + color.g + color.b < 380 ? 'white' : 'black'},
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Controle Serial ESP32</Text>

      {/* Seção de Conexão */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conexão Serial</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Porto:</Text>
          <TextInput
            style={styles.input}
            value={portName}
            onChangeText={setPortName}
            placeholder="COM1"
            editable={!isConnected}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Baud Rate:</Text>
          <TextInput
            style={styles.input}
            value={baudRate}
            onChangeText={setBaudRate}
            keyboardType="numeric"
            placeholder="115200"
            editable={!isConnected}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            title={isConnected ? 'Desconectar' : 'Conectar'}
            onPress={isConnected ? disconnectFromPort : connectToPort}
            color={isConnected ? '#ff3b30' : '#4cd964'}
          />
          {isConnected && (
            <Button
              title="Atualizar Valores"
              onPress={requestTemperatureAndPressure}
              color="#007aff"
            />
          )}
        </View>

        {/* Status de conexão */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text
            style={[
              styles.statusValue,
              isConnected ? styles.connected : styles.disconnected,
            ]}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>

      {/* Seção de Leituras */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leituras Atuais</Text>
        <View style={styles.readingRow}>
          <Text style={styles.readingLabel}>Temperatura:</Text>
          <Text style={styles.readingValue}>
            {currentTemp !== null ? `${currentTemp.toFixed(1)} °C` : '--.--'}
          </Text>
        </View>
        <View style={styles.readingRow}>
          <Text style={styles.readingLabel}>Pressão:</Text>
          <Text style={styles.readingValue}>
            {currentPressure !== null
              ? `${currentPressure.toFixed(1)} hPa`
              : '--.--'}
          </Text>
        </View>
      </View>

      {/* Seção de Temperatura e Pressão */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Setpoints</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Temperatura (°C):</Text>
          <TextInput
            style={styles.input}
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
            placeholder="37.0"
          />
          <Button
            title="Definir"
            onPress={setTempSetpoint}
            disabled={!isConnected}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pressão (hPa):</Text>
          <TextInput
            style={styles.input}
            value={pressure}
            onChangeText={setPressure}
            keyboardType="numeric"
            placeholder="1013.2"
          />
          <Button
            title="Definir"
            onPress={setPressureSetpoint}
            disabled={!isConnected}
          />
        </View>
      </View>

      {/* Seção de Esteira */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controle da Esteira</Text>
        <View style={styles.controlRow}>
          <Text style={styles.label}>Velocidade:</Text>
          <Text style={styles.valueText}>{treadmillSpeed}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={169}
          step={1}
          value={treadmillSpeed}
          onValueChange={handleSpeedChange}
          minimumTrackTintColor="#4cd964"
          maximumTrackTintColor="#000000"
          thumbTintColor="#007aff"
          disabled={!isConnected}
        />
        <View style={styles.controlRow}>
          <Text style={styles.label}>Inclinação:</Text>
          <Text style={styles.valueText}>{treadmillIncline}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={30}
          step={1}
          value={treadmillIncline}
          onValueChange={handleInclineChange}
          minimumTrackTintColor="#4cd964"
          maximumTrackTintColor="#000000"
          thumbTintColor="#007aff"
          disabled={!isConnected}
        />
      </View>

      {/* Seção de Modo de Operação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modo de Operação</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Modo:</Text>
          <Text style={styles.valueText}>
            {operationMode === OperationMode.AUTOMATIC
              ? 'Automático'
              : 'Manual'}
          </Text>
          <Switch
            value={operationMode === OperationMode.AUTOMATIC}
            onValueChange={toggleOperationMode}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={
              operationMode === OperationMode.AUTOMATIC ? '#007aff' : '#f4f3f4'
            }
          />
        </View>

        {operationMode === OperationMode.MANUAL && (
          <>
            <View style={styles.controlRow}>
              <Text style={styles.label}>Potência Aquecedor:</Text>
              <Text style={styles.valueText}>{heaterPower}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={heaterPower}
              onValueChange={handleHeaterPowerChange}
              minimumTrackTintColor="#ff9500"
              maximumTrackTintColor="#000000"
              thumbTintColor="#ff3b30"
              disabled={!isConnected}
            />

            <View style={styles.controlRow}>
              <Text style={styles.label}>Potência Bomba:</Text>
              <Text style={styles.valueText}>{pumpPower}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={pumpPower}
              onValueChange={handlePumpPowerChange}
              minimumTrackTintColor="#34c759"
              maximumTrackTintColor="#000000"
              thumbTintColor="#5ac8fa"
              disabled={!isConnected}
            />
          </>
        )}
      </View>

      {/* Seção de Iluminação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controle de Iluminação</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Lâmpada:</Text>
          <Switch
            value={lampOn}
            onValueChange={toggleLamp}
            trackColor={{false: '#767577', true: '#ffd60a'}}
            thumbColor={lampOn ? '#ffcc00' : '#f4f3f4'}
            disabled={!isConnected}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>LEDs:</Text>
          <Switch
            value={ledsOn}
            onValueChange={toggleLeds}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={ledsOn ? '#007aff' : '#f4f3f4'}
            disabled={!isConnected}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Neon:</Text>
          <Switch
            value={neonOn}
            onValueChange={toggleNeon}
            trackColor={{false: '#767577', true: '#ff2d55'}}
            thumbColor={neonOn ? '#ff2d55' : '#f4f3f4'}
            disabled={!isConnected}
          />
        </View>
      </View>

      {/* Seção de Cores RGB */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controle de Cores RGB</Text>
        <Text style={styles.subTitle}>LED Externo</Text>
        <View style={styles.colorGrid}>
          <ColorButton
            color={RGBColors.RED}
            onPress={() => setRgbExternal(RGBColors.RED)}
            title="R"
          />
          <ColorButton
            color={RGBColors.GREEN}
            onPress={() => setRgbExternal(RGBColors.GREEN)}
            title="G"
          />
          <ColorButton
            color={RGBColors.BLUE}
            onPress={() => setRgbExternal(RGBColors.BLUE)}
            title="B"
          />
          <ColorButton
            color={RGBColors.WHITE}
            onPress={() => setRgbExternal(RGBColors.WHITE)}
            title="W"
          />
          <ColorButton
            color={RGBColors.YELLOW}
            onPress={() => setRgbExternal(RGBColors.YELLOW)}
            title="Y"
          />
          <ColorButton
            color={RGBColors.CYAN}
            onPress={() => setRgbExternal(RGBColors.CYAN)}
            title="C"
          />
        </View>

        <Text style={styles.subTitle}>LED Interno</Text>
        <View style={styles.colorGrid}>
          <ColorButton
            color={RGBColors.RED}
            onPress={() => setRgbInternal(RGBColors.RED)}
            title="R"
          />
          <ColorButton
            color={RGBColors.GREEN}
            onPress={() => setRgbInternal(RGBColors.GREEN)}
            title="G"
          />
          <ColorButton
            color={RGBColors.BLUE}
            onPress={() => setRgbInternal(RGBColors.BLUE)}
            title="B"
          />
          <ColorButton
            color={RGBColors.WHITE}
            onPress={() => setRgbInternal(RGBColors.WHITE)}
            title="W"
          />
          <ColorButton
            color={RGBColors.YELLOW}
            onPress={() => setRgbInternal(RGBColors.YELLOW)}
            title="Y"
          />
          <ColorButton
            color={RGBColors.CYAN}
            onPress={() => setRgbInternal(RGBColors.CYAN)}
            title="C"
          />
        </View>

        <View style={styles.previewContainer}>
          <View
            style={[
              styles.colorPreview,
              {
                backgroundColor: `rgb(${rgbExternal.r}, ${rgbExternal.g}, ${rgbExternal.b})`,
              },
            ]}>
            <Text style={styles.previewText}>Externo</Text>
          </View>
          <View
            style={[
              styles.colorPreview,
              {
                backgroundColor: `rgb(${rgbInternal.r}, ${rgbInternal.g}, ${rgbInternal.b})`,
              },
            ]}>
            <Text style={styles.previewText}>Interno</Text>
          </View>
        </View>

        <Button
          title="Aplicar Cores"
          onPress={setRgbColors}
          disabled={!isConnected || !ledsOn}
          color="#007aff"
        />
      </View>

      {/* Seção de Aromatizador */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aromatizador</Text>
        <Button
          title="Ativar Aromatizador (Pulso 300ms)"
          onPress={activateAroma}
          disabled={!isConnected}
          color="#4cd964"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} BioTriagem
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    width: 120,
    marginRight: 8,
    color: '#444',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007aff',
    minWidth: 50,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorButton: {
    width: '30%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  colorButtonText: {
    fontWeight: 'bold',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorPreview: {
    width: '48%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
    color: '#444',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  connected: {
    color: '#4cd964',
  },
  disconnected: {
    color: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 8,
    textAlign: 'center',
  },
  readingLabel: {
    fontSize: 16,
    color: '#444',
  },
  readingValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007aff',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
});

export default SerialControlExample;
