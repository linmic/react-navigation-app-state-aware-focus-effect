# react-navigation-app-state-aware-focus-effect

[![linmic](https://circleci.com/gh/linmic/react-navigation-app-state-aware-focus-effect.svg?style=shield)](https://app.circleci.com/pipelines/github/linmic/react-navigation-app-state-aware-focus-effect)

AppState-aware focus effect for React Native with React Navigation

## Background

In React Native app development, there's an everyday use case where we would like to perform actions whenever the view is re-focused or re-surfaced from the background, e.g., re-fetching data to make sure it's up-to-date. It is often necessary for apps to display the information that accuracy can be critical, such as financial applications.

This hook could be helpful for those applications that use [React Navigation](https://reactnavigation.org/) and have a similar need.

## Installation

```sh
npm i react-navigation-app-state-aware-focus-effect # or
yarn add react-navigation-app-state-aware-focus-effect
```

## Usage

### Minimal example

```js
import useAppStateAwareFocusEffect from 'react-navigation-app-state-aware-focus-effect';

const req = fetch('https://example.com/dummy.json');

// make sure you memoize the effect
useAppStateAwareFocusEffect(
  useCallback(() => {
    req();
  }, [])
);
```

### A more comprehensive example

```js
import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import useAppStateAwareFocusEffect from 'react-navigation-app-state-aware-focus-effect';

const GET_DOGS = gql`
  query GetDogs {
    dogs {
      id
      breed
    }
  }
`;

const Dogs = () => {
  const { loading, error, data, refetch } = useQuery(GET_DOGS, {
    fetchPolicy: 'cache-and-network',
  });

  useAppStateAwareFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <View>
      {data.dogs.map(({ id, breed }) => (
        <Text key={id}>{breed}</Text>
      ))}
    </View>
  );
};
```

_Note: Just like [useFocusEffect](https://reactnavigation.org/docs/use-focus-effect/), to avoid running the effect too often, it's important to wrap the callback in [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback) before passing it to `useAppStateAwareFocusEffect` as shown in the example._

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
