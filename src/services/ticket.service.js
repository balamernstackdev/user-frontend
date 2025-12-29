import api from './api';

/**
 * Ticket Service
 */

export const createTicket = async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
};

export const getMyTickets = async (params = {}) => {
    const response = await api.get('/tickets/my-tickets', { params });
    return response.data;
};

export const getTicket = async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
};

export const addMessage = async (ticketId, message) => {
    const response = await api.post(`/tickets/${ticketId}/messages`, { message });
    return response.data;
};

export const closeTicket = async (ticketId) => {
    const response = await api.put(`/tickets/${ticketId}/close`);
    return response.data;
};

export default {
    createTicket,
    getMyTickets,
    getTicket,
    addMessage,
    closeTicket
};
