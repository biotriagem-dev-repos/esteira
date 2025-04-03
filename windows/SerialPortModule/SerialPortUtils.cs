using System;
using System.Text;

namespace SerialPortModuleNamespace
{
    /// <summary>
    /// Classe utilitária para manipulação do protocolo de comunicação serial
    /// </summary>
    public static class SerialPortUtils
    {
        // Constantes de delimitadores
        public const byte STX = 0x02;  // Start of Text
        public const byte ETX = 0x03;  // End of Text
        
        // IDs do protocolo
        public const byte MASTER_ID = 0x08;  // ID do controlador (Python/C#)
        public const byte SLAVE_ID = 0x07;   // ID do ESP32
        
        /// <summary>
        /// Formata um comando com valor de 1 byte
        /// </summary>
        public static byte[] FormatCommand(byte commandId, byte value)
        {
            return new byte[] { STX, MASTER_ID, commandId, value, ETX };
        }
        
        /// <summary>
        /// Formata um comando com valor de 2 bytes
        /// </summary>
        public static byte[] FormatCommand(byte commandId, int value)
        {
            byte highByte = (byte)(value >> 8);
            byte lowByte = (byte)(value & 0xFF);
            return new byte[] { STX, MASTER_ID, commandId, highByte, lowByte, ETX };
        }
        
        /// <summary>
        /// Formata um comando sem valor adicional
        /// </summary>
        public static byte[] FormatCommand(byte commandId)
        {
            return new byte[] { STX, MASTER_ID, commandId, ETX };
        }
        
        /// <summary>
        /// Formata um comando com múltiplos bytes de valores
        /// </summary>
        public static byte[] FormatCommand(byte commandId, byte[] values)
        {
            byte[] command = new byte[values.Length + 4]; // STX + ID + CMD + values[] + ETX
            
            command[0] = STX;
            command[1] = MASTER_ID;
            command[2] = commandId;
            
            Array.Copy(values, 0, command, 3, values.Length);
            
            command[command.Length - 1] = ETX;
            
            return command;
        }
        
        /// <summary>
        /// Converte um valor numérico para o formato fixo de 2 bytes
        /// </summary>
        public static byte[] ValueToBytes(int value)
        {
            byte highByte = (byte)(value >> 8);
            byte lowByte = (byte)(value & 0xFF);
            return new byte[] { highByte, lowByte };
        }
        
        /// <summary>
        /// Converte bytes para um valor inteiro
        /// </summary>
        public static int BytesToValue(byte highByte, byte lowByte)
        {
            return (highByte << 8) | lowByte;
        }
        
        /// <summary>
        /// Converte uma temperatura em float para o formato inteiro usado pelo protocolo
        /// Multiplica por 10 para preservar 1 casa decimal
        /// </summary>
        public static int TemperatureToInt(double temperature)
        {
            return (int)(temperature * 10);
        }
        
        /// <summary>
        /// Converte um valor inteiro do protocolo para temperatura em float
        /// </summary>
        public static double IntToTemperature(int value)
        {
            return value / 10.0;
        }
        
        /// <summary>
        /// Converte uma pressão em float para o formato inteiro usado pelo protocolo
        /// Multiplica por 10 para preservar 1 casa decimal
        /// </summary>
        public static int PressureToInt(double pressure)
        {
            return (int)(pressure * 10);
        }
        
        /// <summary>
        /// Converte um valor inteiro do protocolo para pressão em float
        /// </summary>
        public static double IntToPressure(int value)
        {
            return value / 10.0;
        }
        
        /// <summary>
        /// Retorna uma representação hexadecimal de um array de bytes para debugging
        /// </summary>
        public static string BytesToHexString(byte[] data)
        {
            StringBuilder sb = new StringBuilder(data.Length * 3);
            
            for (int i = 0; i < data.Length; i++)
            {
                sb.AppendFormat("0x{0:X2} ", data[i]);
            }
            
            return sb.ToString().Trim();
        }
        
        /// <summary>
        /// Verifica se o pacote recebido é válido (tem formato correto)
        /// </summary>
        public static bool IsValidPacket(byte[] packet, int length)
        {
            // Pacote mínimo: STX + ID + CMD + ETX
            if (length < 4)
                return false;
                
            // Verifica delimitadores
            if (packet[0] != STX || packet[length - 1] != ETX)
                return false;
                
            return true;
        }
    }
} 