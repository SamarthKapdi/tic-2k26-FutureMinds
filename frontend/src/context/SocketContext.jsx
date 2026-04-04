import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    const token = localStorage.getItem('sahyog_token');
    if (!token) return;

    const s = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      console.log('⚡ Socket connected');
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setConnected(false);
    });

    // Global event toasts for real-time awareness
    s.on('blood:new_request', (data) => {
      toast(`🩸 New blood request: ${data.blood_group} needed`, { icon: '🆘' });
    });

    s.on('blood:new_response', () => {
      toast.success('💉 A donor responded to your blood request!');
    });

    s.on('missing:new_sighting', (data) => {
      toast.success('👁️ New sighting reported for your missing person case!');
    });

    s.on('fund:donation', (data) => {
      toast(`💰 New donation of ₹${data.amount} received!`, { icon: '🎉' });
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, []);

  const on = (event, callback) => {
    if (!socket) return () => {};
    socket.on(event, callback);
    return () => socket.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{ socket, connected, on }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  return ctx || { socket: null, connected: false, on: () => () => {} };
};
