import React from 'react';
import { Button, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';



export function HeaderAppComponent(){

    const navigation = useNavigation();

    const openLogin = () => {
        navigation.dispatch(CommonActions.navigate({
            name: 'Login',
        }));
    };

    return(
        <View>
            <Button onPress={openLogin} title="login"/>
        </View>
    );
}