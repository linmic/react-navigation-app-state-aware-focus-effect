import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

type EffectCallback = () => undefined | void | (() => void);

/**
 * Hook to run an effect when resurfaced from either background or a different view.
 * This can be used to perform side-effects such as refetching data.
 * The passed callback should be wrapped in `React.useCallback` to avoid running the effect too often.
 *
 * @param callback Memoized callback containing the effect.
 */
export default function useAppStateAwareFocusEffect(effect: EffectCallback) {
  const navigation = useNavigation();

  // cleanup is built-in
  useFocusEffect(effect);

  useEffect(() => {
    const handler = (nextAppState: AppStateStatus) => {
      console.log({ nextAppState, navigation });

      if (nextAppState === 'active' && navigation.isFocused()) {
        effect();
      }
    };

    AppState.addEventListener('change', handler);

    return () => {
      AppState.removeEventListener('change', handler);
    };
  }, [effect, navigation]);
}
