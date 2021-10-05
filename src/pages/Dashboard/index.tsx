import React, { useState, useEffect, useCallback  } from 'react'
import { ActivityIndicator } from 'react-native'

import { useAuth } from '../../hooks/auth';
import { useTheme } from 'styled-components'
import { useFocusEffect } from '@react-navigation/native'

import AsyncStorage from '@react-native-async-storage/async-storage';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, ITransactionCardProps } from '../../components/TransactionCard'; 


import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transaction,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer
} from './styles'


export interface DataListProps extends ITransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string
  lastTransaction: string
}

interface HighlightData {
  entries: HighlightProps
  expensives: HighlightProps
  total: HighlightProps
}

export function Dashboard(){
  const [ isLoading, setIsLoading ] = useState(true)
  const [ transactions, setTransactions ] = useState<DataListProps[]>([]);
  const [ highlightData, setHighlightData ] = useState<HighlightData>({} as HighlightData)

  const theme = useTheme();
  const { signOut, user } = useAuth()

  function getLastTransactionDate(
      collection: DataListProps[], 
      type: 'positive' | 'negative'
  ) {

    const collectionFilttered = collection
    .filter(transaction =>  transaction.type === type );

    if(collection.length === 0) {
      return 0
    }

    const lastTransactions = new Date(
      Math.max.apply(Math, collection
        .filter((transaction ) => transaction.type === type)
        .map( (transaction ) => new Date(transaction.date).getTime())));
        
    return `${lastTransactions.getDate()} de ${lastTransactions.toLocaleString('pt-BR', { month: 'long'})}`;

  }

  async function loadTransaction() {
    const dataKey = `@gofinences:transactions_user:${user.id}`;;
    const response = await AsyncStorage.getItem(dataKey)

    const transactions = response ? JSON.parse(response) : [];


    let entriesTotal = 0;
    let expensiveTotal  = 0;


    const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps)  => {

      if(item.type == 'positive') {
        entriesTotal += Number(item.amount);
      } else {
        expensiveTotal += Number(item.amount);
      }

      const amount = Number(item.amount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      const date = Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).format(new Date(item.date));

      return {
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date,
      }
      
    })

    setTransactions(transactionsFormatted);

    const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive');
    const lastTransactionsExpencives = getLastTransactionDate(transactions, 'negative');
    const Totalinterval = lastTransactionsExpencives === 0 
    ? 'Não há Transações'
    : `01 a ${lastTransactionsExpencives}`;

    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction : lastTransactionsEntries === 0 
        ? 'Não há Transações'
        :` Última entrada dia ${lastTransactionsEntries}`
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction : lastTransactionsExpencives === 0 
        ? 'Não há Transações'
        : `Última saída ${lastTransactionsExpencives}`
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction : Totalinterval
      },
      
    })
    
    setIsLoading(false);
  }

  useEffect(()=>{
    loadTransaction()
  },[])

  useFocusEffect(useCallback(() => {
    loadTransaction();
  },[]));

  return (
    <Container>       
      { isLoading ? 
      <LoadContainer> 
        <ActivityIndicator 
          color={theme.colors.primary} 
          size={"large"}/> 
      </LoadContainer>
      :
      <>
        <Header>
          <UserWrapper>
            <UserInfo>
              <Photo source={{uri: user.picture || 'https://avatars.githubusercontent.com/u/27749821?v=4'}}/>
              <User>
                <UserGreeting>Olá,</UserGreeting>
                <UserName>{user.name}</UserName>
              </User>
            </UserInfo>

            <LogoutButton onPress={signOut}>
              <Icon name='power'/>
            </LogoutButton>
            
          </UserWrapper>
        </Header>

        <HighlightCards>
          <HighlightCard type={'up'} title={'Entradas'} amount={highlightData.entries.amount} lastTransaction={highlightData.entries.lastTransaction}/>
          <HighlightCard type={'down'} title={'Saidas'} amount={highlightData.expensives.amount} lastTransaction={highlightData.expensives.lastTransaction}/>
          <HighlightCard type={'total'} title={'Total'} amount={highlightData.total.amount} lastTransaction={highlightData.total.lastTransaction}/>
        </HighlightCards>
      
        <Transaction>
          <Title>Listagem</Title>
          <TransactionList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({item}) => <TransactionCard data={item}/>}
          />
        </Transaction> 
      </>}   
    </Container>
  );
}

