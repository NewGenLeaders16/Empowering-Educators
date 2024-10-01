import React, { ReactNode, useState } from 'react';

export const AppContext = React.createContext({
  channel: null,
  setChannel: (channel: any) => {},
  thread: null,
  setThread: (thread: any) => {},
  selectedIds: new Set(),
  setSelectedIds: (selectedIds: any) => {},
  profileUpdateLoading: false,
  setProfileUpdateLoading: (profileUpdateLoading: boolean) => {},
  updatePathName: '',
  setUpdatePathName: (updatePathName: string) => {},
  session: null,
  setSession: (session: any) => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [channel, setChannel] = useState(null);
  const [thread, setThread] = useState(null);

  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState(new Set());

  const [updatePathName, setUpdatePathName] = useState('');

  const [session, setSession] = useState(null);

  return (
    <AppContext.Provider
      value={{
        channel,
        setChannel,
        thread,
        setThread,
        selectedIds,
        setSelectedIds,
        profileUpdateLoading,
        setProfileUpdateLoading,
        updatePathName,
        setUpdatePathName,
        setSession,
        session,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => React.useContext(AppContext);
