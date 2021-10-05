import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native';

import { useTheme } from 'styled-components';
import { RFValue } from 'react-native-responsive-fontsize';
import { useAuth } from '../../hooks/auth';

import { SigninSocialButton } from '../../components/SigninSocialButton';

import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';


import { 
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper
} from './styles';

export function SignIn() {
  const [ isLoading, setIsLoading ] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();

  const theme = useTheme()

  async function handleSignInWithGoogle() {
    try {
     return await signInWithGoogle();
    } catch (err: any) {
      console.log(err)
      Alert.alert('Não foi possivel conectar conta Google')
      setIsLoading(false);
    } 
    
  }

  async function handleSignInWithApple() {
    try {
      return await signInWithApple();
    } catch (err: any) {
      console.log(err)
      Alert.alert('Não foi possivel conectar conta Apple')
      setIsLoading(false);
    }
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg
            width={RFValue(120)}
            height={RFValue(68)}
          />
          <Title>
          Controle suas {'\n'}
          finanças de forma {'\n'}
          muito simples
          </Title>
        </TitleWrapper>
        <SignInTitle>
          Faça seu login com {'\n'}
          uma das contas abaixo
        </SignInTitle>
      </Header>
      <Footer>
        <FooterWrapper>
          <SigninSocialButton title={'Entrar com Google'} svg={GoogleSvg} onPress={handleSignInWithGoogle}/>
          {Platform.OS === 'ios' &&
          <SigninSocialButton title={'Entrar com Apple'} svg={AppleSvg} onPress={handleSignInWithApple}/> }
        </FooterWrapper>

        { isLoading && <ActivityIndicator  color={theme.colors.shape} size={25} style={{ paddingTop: 18}}/>}
      </Footer>
    </Container>
  );
};
