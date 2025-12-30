import api from './api';

export const ticketService = {
    // Create support ticket
    createTicket: async (ticketData) => {
        const response = await api.post('/tickets', ticketData);
        return response.data;
    },

    // Get user's tickets
    getMyTickets: async (params) => {
        const response = await api.get('/tickets/my-tickets', { params });
        return response.data;
    },

    // Get single ticket
    getTicket: async (id) => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    // Add message
    addMessage: async (ticketId, message) => {
        const response = await api.post(`/tickets/${ticketId}/messages`, { message });
        return response.data;
    },

    // Close ticket
    closeTicket: async (ticketId) => {
        const response = await api.put(`/tickets/${ticketId}/close`);
        return response.data;
    },

    // --- Admin Methods ---

    // Get all tickets
    getAllTickets: async (params) => {
        const response = await api.get('/tickets/admin/all', { params });
        return response.data;
    },

    assignTicket: async (id, adminId) => {
        const response = await api.put(`/tickets/${id}/assign`, { adminId });
        return response.data;
    },

    // Update status
    updateStatus: async (id, status) => {
        const response = await api.put(`/tickets/${id}/status`, { status });
        return response.data;
    }
};

export default ticketService;
