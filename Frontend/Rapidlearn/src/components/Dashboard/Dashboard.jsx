// frontend/src/components/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getUserChats } from '../../services/videoAPI';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    let mounted = true;
    const fetchChats = async () => {
      // Wait until auth is resolved; if not logged in, bail (ProtectedRoute will redirect)
      if (authLoading || !user) return;
      try {
        setLoading(true);
        const res = await getUserChats();
        if (!mounted) return;
        setSessions(res.chats || []);
        setError('');
      } catch (err) {
        if (!mounted) return;
        const apiErr = err.response?.data?.error;
        setError(apiErr || 'Failed to load sessions. Please retry.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchChats();
    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Learning Sessions</h1>
      {loading && <p className="text-gray-500">Loading sessions...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && sessions.length === 0 && (
        <p className="text-gray-600">No sessions yet. Create your first video from the Learn page.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {sessions.map((session) => (
          <div
            key={session.chatId || session.id}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{session.topic || 'Untitled Topic'}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{session.userQuery}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  session.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : session.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {session.status}
              </span>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              {session.updatedAt?.seconds
                ? `Updated ${formatDistanceToNow(new Date(session.updatedAt.seconds * 1000), { addSuffix: true })}`
                : 'Pending update'}
            </div>
            <div className="mt-4 flex space-x-3">
              <Link
                to={`/learn?chatId=${session.chatId || session.id}`}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                View Progress
              </Link>
              {session.finalVideoUrl && (
                <a
                  href={session.finalVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Watch
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;