import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import HomeScreen from './app/(tabs)/index';
import OfferScreen from './app/(tabs)/offer';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
        <Stack.Screen name="Offer" component={OfferScreen} options={{ title: 'Teklif Gönder' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
