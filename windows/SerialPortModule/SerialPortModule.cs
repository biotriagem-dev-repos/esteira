using System;
using System.IO.Ports;
using Microsoft.ReactNative.Managed;

namespace SerialPortModuleNamespace
{
    [ReactModule("SerialPortModule")]
    public class SerialPortModule
    {
        private SerialPort _serialPort;

        [ReactMethod("open")]
        public void Open(string portName, int baudRate, IReactPromise<string> promise)
        {
            try
            {
                _serialPort = new SerialPort(portName, baudRate);
                _serialPort.Open();
                promise.Resolve("Porta aberta com sucesso");
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
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
                    promise.Reject("Porta não está aberta");
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
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
            }
        }

        // Método para ajustar a velocidade da esteira
        // ID_VELOCIDADE = 0x01, valor: índice de 0 a 169
        [ReactMethod("setSpeed")]
        public void SetSpeed(int speedIndex, IReactPromise<string> promise)
        {
            try
            {
                if (speedIndex < 0 || speedIndex > 169)
                {
                    promise.Reject("Índice de velocidade fora do intervalo (0-169)");
                    return;
                }
                // Monta o pacote: [START, MASTER_DATA, ID_VELOCIDADE, speed, END]
                byte[] command = new byte[] { 0x02, 0x08, 0x01, (byte)speedIndex, 0x03 };
                if (_serialPort != null && _serialPort.IsOpen)
                {
                    _serialPort.Write(command, 0, command.Length);
                    promise.Resolve("Comando de velocidade enviado");
                }
                else
                {
                    promise.Reject("Porta não está aberta");
                }
            }
            catch (Exception ex)
            {
                promise.Reject(ex.Message);
            }
        }
    }
}
