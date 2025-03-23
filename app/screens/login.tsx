import React, { useState } from 'react';
import { View, Text } from 'react-native';

import { InputLogin } from '../../components/ui/InputLogin';
import ButtonInput from '../../components/ui/ButtonInput';

export function LoginPage(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View>
            <Text style={loginText}>Login </Text>
            <InputLogin value={email} onChangeText={setEmail} placeholder="Email"/>
            <InputLogin value={password} onChangeText={setPassword} placeholder="Senha"/>
            <ButtonInput/>
        </View>
    );
}

const loginText = {
    color: 'black',
    alignSelf: 'center',
    fontSize: 20,
    margin: 20,
}

