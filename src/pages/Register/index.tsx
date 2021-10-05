import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  Alert,
  Modal, 
  TouchableWithoutFeedback 
} from 'react-native';

import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form';

import uuid from 'react-native-uuid'

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import AsyncStorage  from '@react-native-async-storage/async-storage'

import { InputForm } from '../../components/Form/InputForm';
import { Button } from '../../components/Form/Button';

import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';

import { CategorySelect } from '../CategorySelect';

import { 
  Container,
  Header,
  Title,
  Form,
  Filds,
  TransactionTypes
} from './styles';
import { useAuth } from '../../hooks/auth';


interface FormData {
  name: string;
  amount: string;
}


const schema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  amount: Yup.number()
    .typeError("Informe um valor numérico")
    .positive("O valor não pode ser negativo")
    .required("O preço é obrigatório"),
}).required()

export function Register({}) {
  const [ transactionType , setTransactionType ] = useState('');
  const [ categoryModalOpen , setCategoryModalOpen ] = useState(false);

  const { user } = useAuth()

  
  const [ category , setCategory ] = useState({
    key: 'category',
    name: 'Categoria',
  });

  const navigation = useNavigation()

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  })

  function handleTransactionTypesSelect(type: 'positive' | 'negative') {
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal(){
    setCategoryModalOpen(true)
  }

  function handleCloseSelectCategoryModal(){
    setCategoryModalOpen(false)
  }

  async function handleRegister(form: FormData){
    if(!transactionType) {
      return Alert.alert("Selecione o tipo da transação")
    }
    
    if(category.key === 'category') {
      return Alert.alert("Selecione a categoria")
    }

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date()
    }
    
    try {

      const dataKey = `@gofinences:transactions_user:${user.id}`;
      
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];

      const dataFormatted = [
        ...currentData,
        newTransaction
      ]

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

      reset();
      setTransactionType('');
      setCategory({
        key: 'category',
        name: 'Categoria',
      });

      navigation.navigate("Listagem")

    } catch (err) {
      console.log(err);
      Alert.alert("Não foi possível salvar");
    }
  }


  // useEffect(() => {
  //   async function removeData() {
  //     const dataKey = '@gofinences:transactions';
  //     await AsyncStorage.removeItem(dataKey)
  //   }
  //   removeData()
  // },[])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container >
        
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          
          <Filds>
            <InputForm 
              name={'name'} 
              control={control} 
              placeholder={"Nome"} 
              autoCapitalize={'sentences'}
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />

            <InputForm 
              name={'amount'} 
              control={control} 
              placeholder={"Preço"} 
              keyboardType={'numeric'} 
              error={errors.amount && errors.amount.message}
              
            />

            <TransactionTypes>
              <TransactionTypeButton
              title={'Income'}
              type={"up"}
              onPress={() => handleTransactionTypesSelect('positive')}
              isActive={transactionType === 'positive'}
              />
              <TransactionTypeButton
              title={'Outncome'}
              type={"down"}
              onPress={() => handleTransactionTypesSelect('negative')}
              isActive={transactionType === 'negative'}
              />
            </TransactionTypes>
            <CategorySelectButton title={category.name} onPress={handleOpenSelectCategoryModal}/>
          </Filds>

          <Button title={'enviar'} onPress={handleSubmit(handleRegister)}/>
        </Form>
        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
        
      </Container>
    </TouchableWithoutFeedback>
  );
}

