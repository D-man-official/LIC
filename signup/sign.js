document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const usernameCheck = document.getElementById('usernameCheck');
    const rememberMe = document.getElementById('rememberMe');

    // Load saved credentials if "Remember me" was checked
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername) usernameInput.value = savedUsername;
        if (savedPassword) passwordInput.value = savedPassword;
        rememberMe.checked = true;
    }

    // Username validation with debounce
    let usernameTimeout;
    usernameInput.addEventListener('input', () => {
        clearTimeout(usernameTimeout);
        usernameTimeout = setTimeout(() => {
            const username = usernameInput.value.trim();
            if (username.length >= 3) {
                usernameInput.classList.add('valid');
                usernameInput.classList.remove('error');
                usernameCheck.style.display = 'block';
                usernameCheck.className = 'fas fa-check-circle';
            } else if (username.length > 0) {
                usernameInput.classList.add('error');
                usernameInput.classList.remove('valid');
                usernameCheck.style.display = 'block';
                usernameCheck.className = 'fas fa-exclamation-circle';
            } else {
                usernameInput.classList.remove('valid', 'error');
                usernameCheck.style.display = 'none';
            }
        }, 300);
    });

    // Password strength indicator
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (password.length === 0) {
            passwordInput.classList.remove('valid', 'error');
        } else if (password.length >= 8) {
            passwordInput.classList.add('valid');
            passwordInput.classList.remove('error');
        } else {
            passwordInput.classList.add('error');
            passwordInput.classList.remove('valid');
        }
    });

    // Show/hide password toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
        
        // Add animation effect
        togglePassword.style.transform = 'translateY(-50%) scale(1.2)';
        setTimeout(() => {
            togglePassword.style.transform = 'translateY(-50%) scale(1)';
        }, 200);
    });

    // Form submission with loading state
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validate inputs
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('loading');
        btnText.textContent = 'Authenticating...';
        submitBtn.disabled = true;
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Save credentials if "Remember me" is checked
        if (rememberMe.checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('username');
            localStorage.removeItem('password');
        }
        
        // Check credentials (demo mode)
        if (username === 'Dman' && password === 'dman7047') {
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Simulate success delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Redirect to home page
            window.location.href = "../home/home.html";
        } else {
            // Show error and reset button
            showError('Invalid credentials. Try: Username: Dman, Password: dman7047');
            resetButton();
            
            // Add shake animation to form
            form.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
        }
    });

    // Social login handlers
    document.querySelectorAll('.social-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const platform = e.currentTarget.classList[1]; // google, facebook, etc.
            showMessage(`Signing in with ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`);
            
            // Simulate social login
            setTimeout(() => {
                showError('Social login integration required. Use demo credentials.');
            }, 1000);
        });
    });

    // Forgot password handler
    document.querySelector('.forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt('Enter your email to reset password:');
        if (email) {
            showMessage(`Password reset link sent to ${email} (demo mode)`);
        }
    });

    // Helper functions
    function resetButton() {
        submitBtn.classList.remove('loading');
        btnText.textContent = 'Sign In';
        submitBtn.disabled = false;
    }

    function showError(message) {
        removeMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        const formWrapper = document.querySelector('.form-wrapper');
        formWrapper.insertBefore(errorDiv, form);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 4000);
    }

    function showSuccess(message) {
        removeMessages();
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        const formWrapper = document.querySelector('.form-wrapper');
        formWrapper.insertBefore(successDiv, form);
    }

    function showMessage(message) {
        removeMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        
        const formWrapper = document.querySelector('.form-wrapper');
        formWrapper.insertBefore(messageDiv, form);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    function removeMessages() {
        document.querySelectorAll('.error-message, .success-message').forEach(msg => msg.remove());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to submit
        if (e.ctrlKey && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            form.reset();
            removeMessages();
        }
    });

    // Input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'translateY(0)';
        });
    });
});