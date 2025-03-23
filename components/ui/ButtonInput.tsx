import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function ButtonInput(){
    return(
        <TouchableOpacity style={buttonStyle}>
            <Text>Entrar</Text>
        </TouchableOpacity>
    );
}

const buttonStyle = {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    width: 150,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#001',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
}