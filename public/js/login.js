document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginStatus = document.createElement('div');
    loginStatus.id = 'loginStatus';
    loginForm.appendChild(loginStatus); // Place status inside form for styling

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Show loading state
        submitButton.disabled = true;
        loginStatus.innerText = 'Logging in...';
        loginStatus.style.color = 'black';

        try {
            // Basic client-side validation
            if (!email || !email.includes('@')) throw new Error('Please enter a valid email');
            if (!password) throw new Error('Please enter a password');

            // Authenticate with Lambda
            const response = await fetch(
                'https://fgwxjjo7j9.execute-api.us-east-1.amazonaws.com/test/auth/login',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, remember }),
                }
            );

            const data = await response.json();
            console.log('Login response:', data); // Debug response

            if (data.success) {
                // Establish session by storing tokens in localStorage
                localStorage.setItem('email', email);
                if (data.idToken) localStorage.setItem('idToken', data.idToken);
                if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken && remember) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
                if (data.role) localStorage.setItem('userRole', data.role);

                // Set token expiration time 
                if (data.expiresIn) {
                    localStorage.setItem(
                        'tokenExpiresAt',
                        Date.now() + data.expiresIn * 1000
                    );
                }
                

                loginStatus.innerText = 'Successfully Logged In';
                loginStatus.style.color = 'green';

                // Redirect based on role
                const role = data.role ? data.role.toLowerCase() : null;
                console.log('Normalized role:', role); // Debug role
                switch (role) {
                    case 'student':
                        window.location.href = 'student.html';
                        break;
                    case 'faculty':
                        window.location.href = 'faculty.html';
                        break;
                    case 'admin':
                        window.location.href = 'admin.html';
                        break;
                    default:
                        throw new Error('Unknown role. Please contact support.');
                }
            } else {
                loginStatus.innerText = 'Login Failed: ' + data.message;
                loginStatus.style.color = 'red';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginStatus.innerText =
                'Error logging in: ' + (error.message || 'Unknown error occurred');
            loginStatus.style.color = 'red';
        } finally {
            submitButton.disabled = false; // Re-enable button
        }
    });

    // Periodically check token expiration and refresh tokens if needed
    setInterval(async () => {
        const tokenExpiresAt = parseInt(localStorage.getItem('tokenExpiresAt'), 10);
        if (tokenExpiresAt && Date.now() > tokenExpiresAt - 60 * 1000) {
            console.log('Refreshing tokens...');
            await refreshTokens(); // Refresh tokens 1 minute before expiration
        }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Function to refresh tokens using the refresh token
    async function refreshTokens() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return; // No refresh token available

        try {
            const response = await fetch(
                'https://fgwxjjo7j9.execute-api.us-east-1.amazonaws.com/test/auth/refresh',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, refreshToken, action: 'refresh' }),
                }
            );

            const data = await response.json();
            console.log('Refresh response:', data);

            if (data.success) {
                if (data.idToken) localStorage.setItem('idToken', data.idToken);
                if (data.accessToken)
                    localStorage.setItem('accessToken', data.accessToken);
                if (data.expiresIn) {
                    localStorage.setItem(
                        'tokenExpiresAt',
                        Date.now() + data.expiresIn * 1000
                    );
                }
            } else {
                console.error('Failed to refresh tokens:', data.message);
                logout(); // Clear session and redirect to login
            }
        } catch (error) {
            console.error('Error refreshing tokens:', error);
            logout(); // Clear session and redirect to login on failure
        }
    }

    // Logout function to clear session and redirect to login page
    function logout() {
        localStorage.clear();
        window.location.href = 'login.html';
    }
});
