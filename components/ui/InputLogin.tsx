import React from 'react';
import { TextInput } from 'react-native';

interface TextInputProps {
    value: string,
    onChangeText: (text: string) => void,
    placeholder?: string,
}
export function InputLogin(props: TextInputProps){

    return(
        <TextInput
            value={props.value}
            placeholder={props.placeholder}
            onChangeText={props.onChangeText}
            style={inputStyle}
         />
    );
}

const inputStyle = {
    borderWidth: 1,
    borderColor: '#777',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
}