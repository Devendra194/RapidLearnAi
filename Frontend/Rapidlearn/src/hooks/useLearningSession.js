import { useState, useEffect } from 'react';
import { getChatStatus } from '../services/videoAPI';

const useLearningSession = (chatId) => {
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    let isSubscribed = true;

    const fetchSession = async () => {
      try {
        const data = await getChatStatus(chatId);
        if (isSubscribed) {
          setChatData(data);
          setLoading(false);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchSession();
    const interval = setInterval(fetchSession, 2000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [chatId]);

  return { chatData, loading, error };
};

export default useLearningSession;