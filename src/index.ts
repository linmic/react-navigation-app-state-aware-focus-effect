import type { RefObject } from 'react';
import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

type EffectCleanup = undefined | void | (() => void);
type EffectCallback = () => EffectCleanup;

const cleanupIfNeeded = (cleanup: RefObject<EffectCleanup | undefined>) => {
  if (cleanup && cleanup.current && typeof cleanup.current === 'function') {
    cleanup.current();
  }
};

const callback = (effect: EffectCallback) => {
  const destroy = effect();

  if (destroy === undefined || typeof destroy === 'function') {
    return destroy;
  }
};

/**
 * Hook to run an effect when resurfaced from either background or a different view.
 * This can be used to perform side-effects such as refetching data.
 * The passed callback should be wrapped in `React.useCallback` to avoid running the effect too often.
 *
 * @param callback Memoized callback containing the effect.
 */
export default function useAppStateAwareFocusEffect(effect: EffectCallback) {
  let cleanup = useRef<EffectCleanup | undefined>();

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      cleanupIfNeeded(cleanup);

      cleanup.current = callback(effect);

      return () => cleanupIfNeeded(cleanup);
    }, [effect])
  );

  useEffect(() => {
    const handler = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && navigation.isFocused()) {
        cleanupIfNeeded(cleanup);

        cleanup.current = callback(effect);
      } else {
        cleanupIfNeeded(cleanup);

        cleanup.current = undefined;
      }
    };

    const subscription = AppState.addEventListener('change', handler);

    return () => {
      subscription.remove();

      cleanupIfNeeded(cleanup);
    };
  }, [effect, navigation]);
}
