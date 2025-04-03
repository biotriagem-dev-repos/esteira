import {NativeModules} from 'react-native';

/**
 * Interface que define o módulo de porta serial
 */
export interface SerialPortModule {
  // Métodos básicos de conexão
  open(portName: string, baudRate: number): Promise<boolean>;
  close(): Promise<boolean>;
  write(data: string): Promise<boolean>;

  // Métodos para controle da esteira
  setSpeed(speed: number): Promise<boolean>;
  setIncline(incline: number): Promise<boolean>;

  // Métodos para controle ambiental
  setTemperature(temperature: number): Promise<boolean>;
  setPressure(pressure: number): Promise<boolean>;

  // Solicitações de leitura
  requestTemperature(): Promise<boolean>;
  requestPressure(): Promise<boolean>;

  // Métodos de controle manual
  setOperationMode(mode: OperationMode): Promise<boolean>;
  setHeaterPower(power: number): Promise<boolean>;
  setPumpPower(power: number): Promise<boolean>;

  // Métodos para controle de iluminação
  setLamp(state: boolean): Promise<boolean>;
  setLeds(state: boolean): Promise<boolean>;
  setNeon(state: boolean): Promise<boolean>;
  setRgbColor(
    r1: number,
    g1: number,
    b1: number,
    r2: number,
    g2: number,
    b2: number,
  ): Promise<boolean>;

  // Método para ativar aromatizador
  activateAroma(): Promise<boolean>;

  // Métodos para gestão de eventos
  addListener(
    eventName: string,
    callback: (event: any) => void,
  ): {remove: () => void};
  removeListeners(count: number): void;
}

/**
 * Interface para cores RGB
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Enumeração de modos de operação
 */
export enum OperationMode {
  MANUAL = 0,
  AUTOMATIC = 1,
}

/**
 * Função para obter a instância do módulo de porta serial
 * Acessa diretamente o módulo nativo
 */
export function useSerialPortModule(): SerialPortModule {
  return NativeModules.SerialPortModule as SerialPortModule;
}

/**
 * Cores RGB predefinidas
 */
export const RGBColors = {
  RED: {r: 255, g: 0, b: 0},
  GREEN: {r: 0, g: 255, b: 0},
  BLUE: {r: 0, g: 0, b: 255},
  WHITE: {r: 255, g: 255, b: 255},
  BLACK: {r: 0, g: 0, b: 0},
  YELLOW: {r: 255, g: 255, b: 0},
  CYAN: {r: 0, g: 255, b: 255},
  MAGENTA: {r: 255, g: 0, b: 255},
  ORANGE: {r: 255, g: 165, b: 0},
  PURPLE: {r: 128, g: 0, b: 128},
};
