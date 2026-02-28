import useRootStore from '../rootStore.js';

export default function useSessionSlice() {
  const setSessions = useRootStore(state => state.setSessions);
  return { setSessions };
}
