import {NativeModules} from 'react-native';
import type {EmitterSubscription} from 'react-native';

/**
 * Interface para o módulo nativo SerialPortModule
 */
interface SerialPortModule {
  /**
   * Abre a porta serial
   * @param portName Nome da porta (ex: "COM1")
   * @param baudRate Taxa de transmissão (ex: 115200)
   */
  open(portName: string, baudRate: number): Promise<string>;

  /**
   * Fecha a porta serial
   */
  close(): Promise<string>;

  /**
   * Envia dados brutos para a porta serial
   * @param data Array de bytes para enviar
   */
  write(data: number[]): Promise<string>;

  /**
   * Define a velocidade da esteira (índice 0-169)
   * @param speedIndex Índice da tabela de velocidades (0-169)
   */
  setSpeed(speedIndex: number): Promise<string>;

  /**
   * Define a inclinação da esteira (índice 0-30)
   * @param inclineIndex Índice da tabela de inclinação (0-30)
   */
  setIncline(inclineIndex: number): Promise<string>;

  /**
   * Define o setpoint de temperatura
   * @param temperature Temperatura em graus Celsius (ex: 50.0)
   */
  setTemperature(temperature: number): Promise<string>;

  /**
   * Define o setpoint de pressão
   * @param pressure Pressão em hPa (ex: 1013.2)
   */
  setPressure(pressure: number): Promise<string>;

  /**
   * Solicita a temperatura atual ao ESP32
   * O resultado virá através do evento 'temperatureReceived'
   */
  requestTemperature(): Promise<string>;

  /**
   * Solicita a pressão atual ao ESP32
   * O resultado virá através do evento 'pressureReceived'
   */
  requestPressure(): Promise<string>;

  /**
   * Define o modo de operação
   * @param mode 0 para Manual, 1 para Automático
   */
  setOperationMode(mode: number): Promise<string>;

  /**
   * Define a potência do aquecedor no modo manual
   * @param power Potência em porcentagem (0-100)
   */
  setHeaterPower(power: number): Promise<string>;

  /**
   * Define a potência da bomba de vácuo no modo manual
   * @param power Potência em porcentagem (0-100)
   */
  setPumpPower(power: number): Promise<string>;

  /**
   * Liga ou desliga a lâmpada
   * @param state true para ligar, false para desligar
   */
  setLamp(state: boolean): Promise<string>;

  /**
   * Define a cor dos LEDs RGB externos e internos
   * @param rExt Componente vermelho do LED externo (0-255)
   * @param gExt Componente verde do LED externo (0-255)
   * @param bExt Componente azul do LED externo (0-255)
   * @param rInt Componente vermelho do LED interno (0-255)
   * @param gInt Componente verde do LED interno (0-255)
   * @param bInt Componente azul do LED interno (0-255)
   */
  setRgbColor(
    rExt: number,
    gExt: number,
    bExt: number,
    rInt: number,
    gInt: number,
    bInt: number,
  ): Promise<string>;

  /**
   * Liga ou desliga os LEDs
   * @param state true para ligar, false para desligar
   */
  setLeds(state: boolean): Promise<string>;

  /**
   * Liga ou desliga o neon
   * @param state true para ligar, false para desligar
   */
  setNeon(state: boolean): Promise<string>;

  /**
   * Ativa o aromatizador (pulso único de 300ms)
   */
  activateAroma(): Promise<string>;

  /**
   * Adiciona um listener para o evento de temperatura recebida
   */
  addListener(
    eventName: 'temperatureReceived',
    listener: (event: {Value: number}) => void,
  ): EmitterSubscription;

  /**
   * Adiciona um listener para o evento de pressão recebida
   */
  addListener(
    eventName: 'pressureReceived',
    listener: (event: {Value: number}) => void,
  ): EmitterSubscription;

  /**
   * Adiciona um listener para o evento de velocidade recebida
   */
  addListener(
    eventName: 'speedReceived',
    listener: (event: {Value: number}) => void,
  ): EmitterSubscription;

  /**
   * Adiciona um listener para o evento de inclinação recebida
   */
  addListener(
    eventName: 'inclineReceived',
    listener: (event: {Value: number}) => void,
  ): EmitterSubscription;

  /**
   * Adiciona um listener para o evento de erro na comunicação serial
   */
  addListener(
    eventName: 'serialError',
    listener: (event: {Message: string}) => void,
  ): EmitterSubscription;

  /**
   * Remove um listener específico
   */
  removeListener(eventName: string, listener: Function): void;

  /**
   * Remove todos os listeners para um evento específico
   */
  removeAllListeners(eventName: string): void;
}

/**
 * Tabela de cores predefinidas para uso com os LEDs RGB
 */
export const RGBColors = {
  OFF: {r: 0, g: 0, b: 0},
  RED: {r: 255, g: 0, b: 0},
  GREEN: {r: 0, g: 255, b: 0},
  BLUE: {r: 0, g: 0, b: 255},
  WHITE: {r: 255, g: 255, b: 255},
  YELLOW: {r: 255, g: 255, b: 0},
  CYAN: {r: 0, g: 255, b: 255},
  MAGENTA: {r: 255, g: 0, b: 255},
  ORANGE: {r: 255, g: 165, b: 0},
  PURPLE: {r: 128, g: 0, b: 128},
  PINK: {r: 255, g: 192, b: 203},
};

/**
 * Modos de operação do sistema
 */
export enum OperationMode {
  MANUAL = 0,
  AUTOMATIC = 1,
}

/**
 * Hook customizado para usar o módulo serial
 */
export function useSerialPortModule() {
  const {SerialPortModule} = NativeModules;

  return {
    ...(SerialPortModule as SerialPortModule),

    // Funções de utilidade

    /**
     * Define a mesma cor para LEDs internos e externos
     */
    setSingleRgbColor(r: number, g: number, b: number): Promise<string> {
      return SerialPortModule.setRgbColor(r, g, b, r, g, b);
    },

    /**
     * Define a cor usando um objeto predefinido
     */
    setColorPreset(
      colorExt: typeof RGBColors.RED,
      colorInt: typeof RGBColors.RED,
    ): Promise<string> {
      return SerialPortModule.setRgbColor(
        colorExt.r,
        colorExt.g,
        colorExt.b,
        colorInt.r,
        colorInt.g,
        colorInt.b,
      );
    },
  };
}

export default NativeModules.SerialPortModule as SerialPortModule;
