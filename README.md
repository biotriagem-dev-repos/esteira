This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

### For Windows

```bash
# using npm
npm run windows

# OR using Yarn
yarn windows
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

   For **Windows**: Press <kbd>Ctrl</kbd> + <kbd>R</kbd> to reload the app and see your changes!

## Instruções para Usuários Windows e Teste de Portas Seriais

### Requisitos para Windows

1. Certifique-se de ter instalado:
   - Node.js (versão 18 ou superior)
   - Visual Studio 2019 ou 2022 com cargas de trabalho "Desenvolvimento Desktop com C++" e "Desenvolvimento Universal do Windows"
   - Windows 10 SDK (10.0.19041.0 ou superior)

### Rodando o Projeto no Windows

1. Clone o repositório:

   ```bash
   git clone [url-do-repositório]
   cd biotriagemesteira
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o Metro Bundler:

   ```bash
   npm start
   ```

4. Em um novo terminal, execute o aplicativo no Windows:
   ```bash
   npm run windows
   ```

### Testando Portas Seriais

1. **Verificar Portas Disponíveis**:

   - Abra o Gerenciador de Dispositivos do Windows (Win+X → Gerenciador de Dispositivos)
   - Expanda a seção "Portas (COM e LPT)"
   - Anote os nomes das portas disponíveis (ex: COM1, COM2, COM3)

2. **Configurar a Porta Serial no Aplicativo**:

   - Por padrão, o aplicativo tenta se conectar à porta COM3
   - Para modificar a porta, abra o arquivo `App.tsx` e altere a linha:
     ```javascript
     SerialPortModule.open('COM3', 9600);
     ```
     Substituindo 'COM3' pelo nome da porta que você deseja utilizar

3. **Testar a Conexão**:

   - Conecte seu dispositivo serial ao computador
   - Execute o aplicativo no Windows
   - Clique no botão "Abrir Porta" para iniciar a conexão
   - Use os botões "Aumentar" e "Diminuir" para alterar a velocidade
   - Clique em "Enviar Velocidade" para transmitir o comando para o dispositivo
   - Verifique o status da operação na parte inferior da tela

4. **Solução de Problemas**:
   - Se ocorrer um erro de acesso, certifique-se de que a porta não está sendo usada por outro programa
   - Verifique se as configurações de baud rate (9600) correspondem às do seu dispositivo
   - Se necessário, execute o Visual Studio como administrador para ter acesso completo às portas seriais

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
