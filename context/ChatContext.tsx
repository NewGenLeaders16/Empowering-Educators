import React, { ReactNode, useState } from 'react';

export const AppContext = React.createContext({
  channel: null,
  setChannel: (channel: any) => {},
  thread: null,
  setThread: (thread: any) => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [channel, setChannel] = useState(null);
  const [thread, setThread] = useState(null);

  return (
    <AppContext.Provider value={{ channel, setChannel, thread, setThread }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => React.useContext(AppContext);
