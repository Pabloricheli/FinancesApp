import React, { useState, useCallback} from 'react';
import { ActivityIndicator } from 'react-native'

import { useFocusEffect } from '@react-navigation/core';

import { RFValue } from 'react-native-responsive-fontsize';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useTheme } from 'styled-components'
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale'

import AsyncStorage from '@react-native-async-storage/async-storage';


import { VictoryPie } from 'victory-native'

import { categories } from '../../utils/categories';

import { HistoryCard } from '../../components/HistoryCard';

import { 
  Container,
  Header,
  Title, 
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from './styles';
import { useAuth } from '../../hooks/auth';



interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalformatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  const [ isLoading, setIsLoading ] = useState(false)
  const [ selectedDate, setSelectedDate ] = useState(new Date())
  const [ totalCategories , setTotalCategories ] = useState<CategoryData[]>([])

  const {user} = useAuth()

  const theme = useTheme()

  function handleDateChange(action: 'next' | 'prev'){
    if(action === 'next'){
      setSelectedDate(addMonths(selectedDate,1))
    } else {
      setSelectedDate(subMonths(selectedDate,1))
    }
  }

  async function loadData() {
    setIsLoading(true)
    const dataKey = `@gofinences:transactions_user:${user.id}`;;
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted
      .filter((expensive : TransactionData) => 
        expensive.type === 'negative' &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
      );

    const expensiveTotal = expensives.reduce((acumullator : number , expencive : TransactionData ) => {
      return acumullator + Number(expencive.amount)
    }, 0)

    const totalByCategory: CategoryData[] = [];

    categories.forEach(category => {

      let categorySum = 0;

      expensives.forEach((expensive : TransactionData) => {
        if(expensive.category === category.key){
          categorySum += Number(expensive.amount);
        }
      });

      if(categorySum > 0) {
        const totalformatted = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })

        const percent = `${(categorySum / expensiveTotal * 100).toFixed(0)}%`

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalformatted,
          percent
        })
      }
      
    })

    setTotalCategories(totalByCategory);
    setIsLoading(false)
  }

   
  useFocusEffect(useCallback(() => {
    loadData()
  },[selectedDate]));

  return (
    <Container >
          <Header>
            <Title>Resumo por categoria</Title>
          </Header>
      {
        isLoading ? 
        <LoadContainer> 
          <ActivityIndicator 
            color={theme.colors.primary} 
            size={"large"}/> 
        </LoadContainer>
        :
        <Content  
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 24, 
            paddingBottom: useBottomTabBarHeight() ,
          }}
          
        >

          <MonthSelect>
            <MonthSelectButton>
              <MonthSelectIcon name={"chevron-left"} onPress={() => handleDateChange('prev')}/>
            </MonthSelectButton>
                
                  <Month>{format(selectedDate, 'MMMM, yyyy', {locale: ptBR})}</Month>
                
            <MonthSelectButton>
              <MonthSelectIcon name={"chevron-right"} onPress={() => handleDateChange('next')}/>
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie 
              data={totalCategories}
              colorScale={totalCategories.map(category=> category.color)}
              style={{
                labels: { 
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.shape
              }
              }}
              labelRadius={70}
              x={"percent"}
              y={"total"}
            />
          </ChartContainer>
          
          {
            totalCategories.map(item => (
              <HistoryCard 
              key={item.key}
              title={item.name}
              amount={item.totalformatted}
              color={item.color}
              />
            ))      
          }
        </Content>
        
      }
    </Container>
  );
};