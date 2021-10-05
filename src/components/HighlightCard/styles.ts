import styled, {css} from "styled-components/native";
import {Feather} from '@expo/vector-icons'
import { RFValue } from 'react-native-responsive-fontsize'

interface TypeProps {
  type: 'up' | 'down' | 'total';
}

export const Container = styled.View<TypeProps>`
  background-color: ${({theme, type})=> type === 'total' 
  ? theme.colors.secundary
  : theme.colors.shape 
  };

  width: ${RFValue(300)}px ;
  border-radius: 5px;

  padding: ${RFValue(19)}px ${RFValue(23)}px;
  padding-bottom: ${RFValue(42)}px;
  margin-right:${RFValue(16)}px;
  
`
export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

export const Title = styled.Text<TypeProps>`
font-size: ${RFValue(14)}px;
font-family: ${({theme}) => theme.fonts.regular};

color: ${({theme, type})=> type === 'total' 
  ? theme.colors.shape
  : theme.colors.text_dark 
  };

`

export const Icon = styled(Feather)<TypeProps>`

${({type}) => type === 'down' && css`color:${({theme}) => theme.colors.attention};`};

${({type}) => type === 'up' && css`color:${({theme}) => theme.colors.sucess};`};

${({type}) => type === 'total' && css`color:${({theme}) => theme.colors.shape};`};

font-size: ${RFValue(40)}px;`

export const Footer = styled.View``

export const Amount = styled.Text<TypeProps>`
font-family: ${({theme}) => theme.fonts.medium};
font-size: ${RFValue(32)}px;

color: ${({theme, type})=> type === 'total' 
  ? theme.colors.shape
  : theme.colors.text_dark 
  };

margin-top: 38px;

`
export const LastTransaction = styled.Text<TypeProps>`
font-size: ${RFValue(12)}px;
font-family: ${({theme}) => theme.fonts.regular};

color: ${({theme, type})=> type === 'total' 
  ? theme.colors.shape
  : theme.colors.text
  };

`