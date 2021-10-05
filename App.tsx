import React from 'react';
import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

import Apploading from 'expo-app-loading'

import { StatusBar } from 'expo-status-bar'

import { Routes } from './src/routes';
import { ThemeProvider } from 'styled-components'
import { AuthProvider, useAuth } from './src/hooks/auth'
import theme from './src/global/styles/theme'



import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins'


export default function App(){
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  })

  const { userStorageLoading } = useAuth()

  if(!fontsLoaded || userStorageLoading) {

    return <Apploading/>

} else {

    return (
      <ThemeProvider theme={theme}>
        <StatusBar style={'light'}/>
          <AuthProvider>
            <Routes/>
          </AuthProvider>
      </ThemeProvider>    
    );
    } 
}