import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { authService } from '../services/auth.service';
import TokenService from '../services/token.service';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const user = authService.getUser();
    const token = TokenService.getToken();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (user && token) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const socketUrl = baseUrl.replace('/api', '');

            const newSocket = io(socketUrl, {
                auth: { token },
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                setConnected(true);
            });

            newSocket.on('new_notification', (notification) => {
                console.log('New notification received:', notification);
                // Show toast for new notification
                toast.info(notification.title || 'New Notification', {
                    onClick: () => {
                        if (notification.link) {
                            window.location.href = notification.link;
                        }
                    }
                });
            });

            // Admin Specific Real-time Alerts
            newSocket.on('new_user_registered', (data) => {
                toast.info(`New User: ${data.name} just registered!`, {
                    onClick: () => window.location.href = '/admin/users'
                });
            });

            newSocket.on('new_payment', (data) => {
                toast.success(`💰 New Sale: ₹${data.amount} (${data.planName})`, {
                    onClick: () => window.location.href = '/admin/transactions'
                });
            });

            newSocket.on('new_commission', (data) => {
                toast.success(`💸 New Commission Generated: ₹${data.amount}`, {
                    onClick: () => window.location.href = '/admin/commissions'
                });
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from socket server');
                setConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.off();
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.off();
                socket.close();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [user?.id, token]); // Only re-run if user ID or token changes

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
