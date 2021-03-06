import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useAppStateAwareFocusEffect from 'react-navigation-app-state-aware-focus-effect';

function HomeScreen() {
  const memoizedEffect = useCallback(() => {
    Alert.alert('Effect', 'Effect triggered!');

    return () => {
      console.log('cleaned');
    };
  }, []);

  useAppStateAwareFocusEffect(memoizedEffect);

  return (
    <View style={styles.container}>
      <Text>Home!</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
