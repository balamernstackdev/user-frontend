const TokenService = {
    getToken() {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.accessToken || null; // Access token is likely inside the user object looking at existing code?
        // Wait, looking at auth.service.js: 
        // login: localStorage.setItem('user', JSON.stringify(response.data.data.user));
        // But the response also has accessToken separately: response.data.data.accessToken
        // The current implementation in auth.service.js line 12 only stores 'user' object!
        // It does NOT store the accessToken separately?
        // Let's check auth.controller output:
        // res.json({ ..., data: { user: {...}, accessToken: ... } })

        // Wait, if auth.service.js only stores 'user', and 'user' object doesn't contain accessToken...
        // Then getToken() will fail?
    },

    setToken(accessToken) {
        // This logic in api.js line 51 calls authService.setToken(accessToken).
        // Check auth.service.js for setToken method... it does NOT exist in the viewed file!
        // This confirms api.js is calling a non-existent method authService.setToken?
    },

    getUser() {
        return JSON.parse(localStorage.getItem('user'));
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    updateToken(accessToken) {
        const user = this.getUser();
        if (user) {
            user.accessToken = accessToken;
            this.setUser(user);
        }
    },

    removeUser() {
        localStorage.removeItem('user');
    }
};

export default TokenService;
