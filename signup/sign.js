document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Show/hide password toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Very basic credentials check
        if (username === 'Dman' && password === 'dman7047') {
            // Success - redirect
         window.location.href = "../home/home.html";

        } else {
            // Show error (you can style this better)
            showError('Incorrect username or password!');
        }
    });

    // Simple error message function
    function showError(message) {
        // Remove any previous error message
        const oldError = document.querySelector('.error-message');
        if (oldError) oldError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #e74c3c;
            background: rgba(231, 76, 60, 0.1);
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: 500;
        `;
        errorDiv.textContent = message;

        const formWrapper = document.querySelector('.form-wrapper');
        formWrapper.insertBefore(errorDiv, form);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 4000);
    }
});