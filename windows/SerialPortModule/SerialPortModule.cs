using System;
using System.IO.Ports;
using Microsoft.ReactNative.Managed;

namespace SerialPortModuleNamespace
{
    /// <summary>
    /// Módulo de comunicação serial com ESP32 para controle do sistema
    /// Implementa o protocolo descrito na documentação
    /// </summary>
    [ReactModule("SerialPortModule")]
    public class SerialPortModule
    {
        // Comandos conforme documentação
        private const byte CMD_VELOCIDADE = 0x01;      // Velocidade Esteira (0-169)
        private const byte CMD_INCLINACAO = 0x05;      // Inclinação Esteira (0-30)
        private const byte CMD_PRESSAO = 0x04;         // Setpoint Pressão (2 bytes)
        private const byte CMD_TEMPERATURA = 0x06;     // Setpoint Temperatura (2 bytes)
        private const byte CMD_REQ_TEMPERATURA = 0x09; // Solicitar Temperatura
        private const byte CMD_REQ_PRESSAO = 0x0A;     // Solicitar Pressão
        private const byte CMD_MODO = 0x0F;            // Alternar Modo (0=Manual, 1=Automático)
        private const byte CMD_AQUECEDOR = 0x10;       // Potência Aquecedor (0-100%)
        private const byte CMD_BOMBA = 0x11;           // Potência Bomba de Vácuo (0-100%)
        private const byte CMD_LAMPADA = 0x12;         // Ligar/Desligar Lâmpada (0=Off, 1=On)
        private const byte CMD_RGB = 0x13;             // Enviar Cor LEDs RGB (6 bytes)
        private const byte CMD_LEDS = 0x15;            // Ligar/Desligar LEDs (0=Off, 1=On)
        private const byte CMD_NEON = 0x16;            // Neon On/Off (0=Off, 1=On)
        private const byte CMD_AROMATIZADOR = 0x17;    // Aromatizador Pulso (valor fixo = 1)

        // Respostas do ESP32
        private const byte RESP_TEMPERATURA = 0x0B;    // Resposta de Temperatura Atual (2 bytes)
        private const byte RESP_PRESSAO = 0x0C;        // Resposta de Pressão Atual (2 bytes)
        private const byte RESP_VELOCIDADE = 0x0D;     // Resposta de Velocidade Atual (2 bytes)
        private const byte RESP_INCLINACAO = 0x0E;     // Resposta de Inclinação Atual (2 bytes)

        private SerialPort _serialPort;
        private byte[] _responseBuffer = new byte[128]; // Buffer para leitura de respostas
        private int _responseIndex = 0;
        private bool _responseInProgress = false;

        // Event emitter para enviar eventos ao React Native
        private IReactEventEmitter _eventEmitter;

        [ReactInitializer]
        public void Initialize(IReactContext reactContext)
        {
            _eventEmitter = reactContext.EventEmitter;
            
            // Define os nomes dos eventos
            TemperatureReceived = "temperatureReceived";
            PressureReceived = "pressureReceived";
            SpeedReceived = "speedReceived";
            InclineReceived = "inclineReceived";
            SerialError = "serialError";
        }

        // Eventos emitidos
        [ReactEvent]
        public string TemperatureReceived { get; set; }

        [ReactEvent]
        public string PressureReceived { get; set; }

        [ReactEvent]
        public string SpeedReceived { get; set; }

        [ReactEvent]
        public string InclineReceived { get; set; }

        [ReactEvent]
        public string SerialError { get; set; }

        [ReactMethod("open")]
        public void Open(string portName, int baudRate, IReactPromise<string> promise)
        {
            try
            {
                _serialPort = new SerialPort(portName, baudRate);
                _serialPort.DataReceived += SerialPort_DataReceived;
                _serialPort.Open();
                promise.Resolve("Porta aberta com sucesso");
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        [ReactMethod("write")]
        public void Write(byte[] data, IReactPromise<string> promise)
        {
            try
            {
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(data, 0, data.Length);
                    promise.Resolve("Dados enviados com sucesso");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        [ReactMethod("close")]
        public void Close(IReactPromise<string> promise)
        {
            try
            {
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Close();
                    _serialPort.DataReceived -= SerialPort_DataReceived;
                    promise.Resolve("Porta fechada com sucesso");
                }
                else
                {
                    promise.Resolve("Porta já estava fechada");
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        #region Métodos para controle da esteira

        // Método para ajustar a velocidade da esteira
        // CMD_VELOCIDADE = 0x01, valor: índice de 0 a 169
        [ReactMethod("setSpeed")]
        public void SetSpeed(int speedIndex, IReactPromise<string> promise)
        {
            try
            {
                if (speedIndex < 0 || speedIndex > 169)
                {
                    var msg = "Índice de velocidade fora do intervalo (0-169)";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }
                
                byte[] command = SerialPortUtils.FormatCommand(CMD_VELOCIDADE, (byte)speedIndex);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Comando de velocidade enviado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para ajustar a inclinação da esteira
        // CMD_INCLINACAO = 0x05, valor: índice de 0 a 30
        [ReactMethod("setIncline")]
        public void SetIncline(int inclineIndex, IReactPromise<string> promise)
        {
            try
            {
                if (inclineIndex < 0 || inclineIndex > 30)
                {
                    var msg = "Índice de inclinação fora do intervalo (0-30)";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }
                
                byte[] command = SerialPortUtils.FormatCommand(CMD_INCLINACAO, (byte)inclineIndex);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Comando de inclinação enviado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        #endregion

        #region Métodos para controle de temperatura e pressão

        // Método para definir o setpoint de temperatura
        // CMD_TEMPERATURA = 0x06, valor: temperatura * 10 (2 bytes)
        [ReactMethod("setTemperature")]
        public void SetTemperature(double temperature, IReactPromise<string> promise)
        {
            try
            {
                // Converte temperatura para o formato esperado (temp * 10, 2 bytes)
                int tempValue = SerialPortUtils.TemperatureToInt(temperature);
                if (tempValue < 0 || tempValue > 65535)
                {
                    var msg = "Valor de temperatura fora do intervalo válido";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }

                byte[] command = SerialPortUtils.FormatCommand(CMD_TEMPERATURA, tempValue);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Comando de temperatura enviado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para definir o setpoint de pressão
        // CMD_PRESSAO = 0x04, valor: pressão * 10 (2 bytes)
        [ReactMethod("setPressure")]
        public void SetPressure(double pressure, IReactPromise<string> promise)
        {
            try
            {
                // Converte pressão para o formato esperado (pressão * 10, 2 bytes)
                int pressureValue = SerialPortUtils.PressureToInt(pressure);
                if (pressureValue < 0 || pressureValue > 65535)
                {
                    var msg = "Valor de pressão fora do intervalo válido";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }

                byte[] command = SerialPortUtils.FormatCommand(CMD_PRESSAO, pressureValue);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Comando de pressão enviado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para solicitar a temperatura atual
        // CMD_REQ_TEMPERATURA = 0x09, sem valor adicional
        [ReactMethod("requestTemperature")]
        public void RequestTemperature(IReactPromise<string> promise)
        {
            try
            {
                byte[] command = SerialPortUtils.FormatCommand(CMD_REQ_TEMPERATURA);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Solicitação de temperatura enviada");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para solicitar a pressão atual
        // CMD_REQ_PRESSAO = 0x0A, sem valor adicional
        [ReactMethod("requestPressure")]
        public void RequestPressure(IReactPromise<string> promise)
        {
            try
            {
                byte[] command = SerialPortUtils.FormatCommand(CMD_REQ_PRESSAO);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Solicitação de pressão enviada");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        #endregion

        #region Métodos para controle operacional

        // Método para alternar o modo de operação
        // CMD_MODO = 0x0F, valor: 0=Manual, 1=Automático
        [ReactMethod("setOperationMode")]
        public void SetOperationMode(int mode, IReactPromise<string> promise)
        {
            try
            {
                if (mode != 0 && mode != 1)
                {
                    var msg = "Modo inválido. Use 0 para Manual ou 1 para Automático";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }
                
                byte[] command = SerialPortUtils.FormatCommand(CMD_MODO, (byte)mode);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Modo de operação alterado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para definir a potência do aquecedor (modo manual)
        // CMD_AQUECEDOR = 0x10, valor: 0-100%
        [ReactMethod("setHeaterPower")]
        public void SetHeaterPower(int power, IReactPromise<string> promise)
        {
            try
            {
                if (power < 0 || power > 100)
                {
                    var msg = "Potência fora do intervalo (0-100)";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }
                
                byte[] command = SerialPortUtils.FormatCommand(CMD_AQUECEDOR, (byte)power);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Potência do aquecedor definida");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para definir a potência da bomba (modo manual)
        // CMD_BOMBA = 0x11, valor: 0-100%
        [ReactMethod("setPumpPower")]
        public void SetPumpPower(int power, IReactPromise<string> promise)
        {
            try
            {
                if (power < 0 || power > 100)
                {
                    var msg = "Potência fora do intervalo (0-100)";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }
                
                byte[] command = SerialPortUtils.FormatCommand(CMD_BOMBA, (byte)power);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Potência da bomba definida");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        #endregion

        #region Métodos para controle de iluminação

        // Método para ligar/desligar a lâmpada
        // CMD_LAMPADA = 0x12, valor: 0=Off, 1=On
        [ReactMethod("setLamp")]
        public void SetLamp(bool state, IReactPromise<string> promise)
        {
            try
            {
                byte stateValue = state ? (byte)1 : (byte)0;
                byte[] command = SerialPortUtils.FormatCommand(CMD_LAMPADA, stateValue);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Estado da lâmpada alterado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para definir a cor dos LEDs RGB
        // CMD_RGB = 0x13, valor: 6 bytes (R, G, B externos + R, G, B internos)
        [ReactMethod("setRgbColor")]
        public void SetRgbColor(int rExt, int gExt, int bExt, int rInt, int gInt, int bInt, IReactPromise<string> promise)
        {
            try
            {
                // Validação dos valores RGB
                if (rExt < 0 || rExt > 255 || gExt < 0 || gExt > 255 || bExt < 0 || bExt > 255 ||
                    rInt < 0 || rInt > 255 || gInt < 0 || gInt > 255 || bInt < 0 || bInt > 255)
                {
                    var msg = "Valor RGB fora do intervalo (0-255)";
                    promise.Reject(msg);
                    EmitError(msg);
                    return;
                }
                
                byte[] rgbValues = new byte[] { 
                    (byte)rExt, (byte)gExt, (byte)bExt, 
                    (byte)rInt, (byte)gInt, (byte)bInt 
                };
                
                byte[] command = SerialPortUtils.FormatCommand(CMD_RGB, rgbValues);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Cor dos LEDs RGB alterada");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para ligar/desligar os LEDs
        // CMD_LEDS = 0x15, valor: 0=Desligar, 1=Ligar
        [ReactMethod("setLeds")]
        public void SetLeds(bool state, IReactPromise<string> promise)
        {
            try
            {
                byte stateValue = state ? (byte)1 : (byte)0;
                byte[] command = SerialPortUtils.FormatCommand(CMD_LEDS, stateValue);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Estado dos LEDs alterado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        // Método para ligar/desligar o neon
        // CMD_NEON = 0x16, valor: 0=Off, 1=On
        [ReactMethod("setNeon")]
        public void SetNeon(bool state, IReactPromise<string> promise)
        {
            try
            {
                byte stateValue = state ? (byte)1 : (byte)0;
                byte[] command = SerialPortUtils.FormatCommand(CMD_NEON, stateValue);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Estado do neon alterado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        #endregion

        #region Métodos adicionais

        // Método para ativar o aromatizador (pulso)
        // CMD_AROMATIZADOR = 0x17, valor fixo = 1
        [ReactMethod("activateAroma")]
        public void ActivateAroma(IReactPromise<string> promise)
        {
            try
            {
                byte[] command = SerialPortUtils.FormatCommand(CMD_AROMATIZADOR, (byte)1);
                
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Aromatizador ativado");
                }
                else
                {
                    var msg = "Porta não está aberta";
                    promise.Reject(msg);
                    EmitError(msg);
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
                EmitError(ex.Message);
            }
        }

        #endregion

        #region Processamento de respostas

        // Manipula os eventos de recebimento de dados
        private void SerialPort_DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            if (_serialPort == null || !_serialPort.IsOpen)
                return;

            try
            {
                int bytesToRead = _serialPort.BytesToRead;
                byte[] buffer = new byte[bytesToRead];
                _serialPort.Read(buffer, 0, bytesToRead);

                // Processa cada byte recebido
                for (int i = 0; i < bytesToRead; i++)
                {
                    ProcessReceivedByte(buffer[i]);
                }
            }
            catch (Exception ex)
            {
                // Emite o evento de erro
                EmitError($"Erro ao ler dados: {ex.Message}");
            }
        }

        // Processa cada byte recebido para montar pacotes
        private void ProcessReceivedByte(byte data)
        {
            if (data == SerialPortUtils.STX)
            {
                // Início de um novo pacote
                _responseIndex = 0;
                _responseBuffer[_responseIndex++] = data;
                _responseInProgress = true;
            }
            else if (_responseInProgress)
            {
                // Adiciona byte ao pacote em progresso
                if (_responseIndex < _responseBuffer.Length)
                {
                    _responseBuffer[_responseIndex++] = data;
                }

                // Verifica se é fim do pacote
                if (data == SerialPortUtils.ETX)
                {
                    _responseInProgress = false;
                    ProcessResponsePacket();
                }
            }
        }

        // Processa um pacote completo de resposta
        private void ProcessResponsePacket()
        {
            if (!SerialPortUtils.IsValidPacket(_responseBuffer, _responseIndex))
                return;

            // Obtém o ID do comando na resposta
            byte cmdId = _responseBuffer[2];

            // Processa baseado no tipo de resposta
            switch (cmdId)
            {
                case RESP_TEMPERATURA:
                    if (_responseIndex >= 6)  // STX + ID + CMD + DATA(2) + ETX
                    {
                        int tempValue = SerialPortUtils.BytesToValue(_responseBuffer[3], _responseBuffer[4]);
                        double temperature = SerialPortUtils.IntToTemperature(tempValue);
                        
                        // Envia evento para o React Native com a temperatura
                        if (_eventEmitter != null)
                        {
                            _eventEmitter.EmitEvent(TemperatureReceived, new { Value = temperature });
                        }
                    }
                    break;

                case RESP_PRESSAO:
                    if (_responseIndex >= 6)  // STX + ID + CMD + DATA(2) + ETX
                    {
                        int pressureValue = SerialPortUtils.BytesToValue(_responseBuffer[3], _responseBuffer[4]);
                        double pressure = SerialPortUtils.IntToPressure(pressureValue);
                        
                        // Envia evento para o React Native com a pressão
                        if (_eventEmitter != null)
                        {
                            _eventEmitter.EmitEvent(PressureReceived, new { Value = pressure });
                        }
                    }
                    break;

                case RESP_VELOCIDADE:
                    if (_responseIndex >= 6)  // STX + ID + CMD + DATA(2) + ETX
                    {
                        int speedValue = SerialPortUtils.BytesToValue(_responseBuffer[3], _responseBuffer[4]);
                        
                        // Envia evento para o React Native com a velocidade
                        if (_eventEmitter != null)
                        {
                            _eventEmitter.EmitEvent(SpeedReceived, new { Value = speedValue });
                        }
                    }
                    break;

                case RESP_INCLINACAO:
                    if (_responseIndex >= 6)  // STX + ID + CMD + DATA(2) + ETX
                    {
                        int inclineValue = SerialPortUtils.BytesToValue(_responseBuffer[3], _responseBuffer[4]);
                        
                        // Envia evento para o React Native com a inclinação
                        if (_eventEmitter != null)
                        {
                            _eventEmitter.EmitEvent(InclineReceived, new { Value = inclineValue });
                        }
                    }
                    break;
            }
        }

        // Emite um evento de erro para o React Native
        private void EmitError(string errorMessage)
        {
            if (_eventEmitter != null)
            {
                _eventEmitter.EmitEvent(SerialError, new { Message = errorMessage });
            }
        }

        #endregion
    }
}
