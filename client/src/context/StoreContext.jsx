import React, { createContext, useContext, useState, useCallback } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [messagesCache, setMessagesCache] = useState({}); // { channelId: messages[] }
  const [tasksCache, setTasksCache] = useState({}); // { channelId: tasks[] }

  const updateChannels = useCallback((newChannels) => setChannels(newChannels), []);
  
  const cacheMessages = useCallback((channelId, messages) => {
    setMessagesCache(prev => ({ ...prev, [channelId]: messages }));
  }, []);

  const cacheTasks = useCallback((channelId, tasks) => {
    setTasksCache(prev => ({ ...prev, [channelId]: tasks }));
  }, []);

  const value = {
    channels,
    messagesCache,
    tasksCache,
    updateChannels,
    cacheMessages,
    cacheTasks
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
