import React, { createContext, ReactNode, useContext , useState, useEffect } from 'react';

import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { CLIENT_ID } = process.env
const { REDIRECT_URI } = process.env

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email:string;
  picture?: string;
}

interface IAuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  userStorageLoading: boolean;
}


interface AuthorizationResponse {
  params: {
    access_token: string
  };
  type: string;
}


const AuthContext = createContext({} as IAuthContextData);


function AuthProvider({ children }: AuthProviderProps ){
  
  const [ user , setUser ] = useState<User>({} as User)
  const [ userStorageLoading, setUserStorageLoading ] = useState(true)
  
  const userStorageKey = '@gofinances:user'

  async function signInWithGoogle() {

    try {
      
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');
    
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { type , params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;
    
      if(type === 'success') {

      const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
      
      const userInfo = await response.json();
      
      setUser({
        id: userInfo.id,
        name: userInfo.name,
        email:userInfo.email,
        picture: userInfo.picture,
      });
      } 

      await AsyncStorage.setItem(userStorageKey, JSON.stringify(user))
    
    } catch (error: any) {
      throw new Error(error);
    }
  };

  async function signInWithApple(){

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes:[
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      });

      if(credential) {
        const name = credential.fullName!.givenName!;
        const userLogged = {
          id: String(credential.user),
          name,
          email: credential.email!,
          picture: `https://ui-avatars.com/api/?name=${name}&length=1`
        }
        setUser(userLogged);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(user))
      }

    } catch (err: any) {
      throw new Error(err)
    }
  };

  async function signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey)
  };

  useEffect(() => {
    async function loadStorageData():Promise<void>{
      const userData = await AsyncStorage.getItem(userStorageKey)
      if(userData){
        const userLogger = JSON.parse(userData) as User;
        setUser(userLogger)
      }
      setUserStorageLoading(true)
    }
    loadStorageData();
  },[]) 

  return (
    
    <AuthContext.Provider value={{
      user,
      signOut,
      signInWithGoogle,
      signInWithApple,
      userStorageLoading,
    }}>
        { children }
     </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext);
  return context;
}



export { AuthContext, AuthProvider, useAuth }