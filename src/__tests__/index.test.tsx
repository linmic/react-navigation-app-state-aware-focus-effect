import React, { createRef } from 'react';
import { render, act } from '@testing-library/react-native';
import {
  useNavigationBuilder,
  TabRouter,
  createNavigatorFactory,
  NavigationHelpersContext,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';

import useAppStateAwareFocusEffect from '../';

const createTabNavigator = createNavigatorFactory((props: any) => {
  const { navigation, state, descriptors } = useNavigationBuilder(
    TabRouter,
    props
  );

  return (
    <NavigationHelpersContext.Provider value={navigation}>
      {state.routes.map((route) => (
        <div key={route.key}>{descriptors[route.key].render()}</div>
      ))}
    </NavigationHelpersContext.Provider>
  );
});

beforeEach(() => {
  jest.resetModules();
  // https://github.com/facebook/jest/issues/6434#issuecomment-525576660
  jest.useFakeTimers();
});

it('runs effect when focused', async () => {
  const Tab = createTabNavigator();

  const effect = jest.fn();

  const TestScreen = () => {
    useAppStateAwareFocusEffect(effect);

    return null;
  };

  const EmptyScreen = () => null;

  const navigation = createRef<NavigationContainerRef>();

  render(
    <NavigationContainer ref={navigation}>
      <Tab.Navigator initialRouteName="First">
        <Tab.Screen name="First" component={EmptyScreen} />
        <Tab.Screen name="Second" component={TestScreen} />
        <Tab.Screen name="Third" component={EmptyScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );

  expect(effect).not.toBeCalled();

  await act(async () => navigation.current?.navigate('Second'));

  expect(effect).toBeCalledTimes(1);

  await act(async () => navigation.current?.navigate('Third'));

  expect(effect).toBeCalledTimes(1);

  await act(async () => navigation.current?.navigate('Second'));

  expect(effect).toBeCalledTimes(2);
});

it('runs effect on resurfaced from background', async () => {
  const effect = jest.fn();
  let capturedChangeCallback = jest.fn();

  const mockAddListener = jest.fn((event, callback) => {
    if (event === 'change') {
      capturedChangeCallback = callback;
    }
    return jest.fn();
  });

  jest.doMock('react-native/Libraries/AppState/AppState', () => ({
    addEventListener: mockAddListener,
  }));

  const TestScreen = () => {
    useAppStateAwareFocusEffect(effect);

    return null;
  };

  const navigation = createRef<NavigationContainerRef>();
  const Tab = createTabNavigator();

  render(
    <NavigationContainer ref={navigation}>
      <Tab.Navigator initialRouteName="Main">
        <Tab.Screen name="Main" component={TestScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );

  expect(effect).toBeCalledTimes(1);

  await act(async () => capturedChangeCallback('active'));

  expect(effect).toBeCalledTimes(2);

  await act(async () => capturedChangeCallback('background'));

  expect(effect).toBeCalledTimes(2);

  await act(async () => capturedChangeCallback('inactive'));

  expect(effect).toBeCalledTimes(2);
});
