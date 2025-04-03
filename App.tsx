import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import SerialControlExample from './src/components/SerialControlExample';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      <SerialControlExample />
    </SafeAreaView>
  );
};

export default App;
