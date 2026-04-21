import { useState, useCallback, useEffect } from 'react';
import api from '../api';

export const useChannelData = (channelId) => {
  const [channel, setChannel] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChannel = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const res = await api.get(`/channels/${channelId}`);
      setChannel(res.data.data);
    } catch (err) {
      setError('Failed to load channel details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  const fetchMembers = useCallback(async () => {
    if (!channelId) return;
    try {
      const res = await api.get(`/channels/${channelId}/members`);
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [channelId]);

  useEffect(() => {
    fetchChannel();
    fetchMembers();
  }, [fetchChannel, fetchMembers]);

  return { channel, members, loading, error, refreshChannel: fetchChannel, refreshMembers: fetchMembers };
};
