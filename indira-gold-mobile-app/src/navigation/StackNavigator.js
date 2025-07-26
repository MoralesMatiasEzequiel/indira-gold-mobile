import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewSale from '../screens/Sales/NewSale/NewSale';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="NewSale">
      <Stack.Screen
        name="NewSale"
        component={NewSale}
        options={{ title: 'Nueva Venta' }} // título en la barra superior
      />
      {/* Agregá aquí más pantallas cuando las vayas migrando */}
    </Stack.Navigator>
  );
};

export default StackNavigator;
