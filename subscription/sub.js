  // Add hover effects for cards
    document.addEventListener('DOMContentLoaded', function() {
      const cards = document.querySelectorAll('.card');
      
      cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
          this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
          this.style.zIndex = '1';
        });
      });
      
      // Add click effect for buttons
      const buttons = document.querySelectorAll('.btn:not(.current)');
      buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Add click animation
          this.style.transform = 'scale(0.95)';
          
          setTimeout(() => {
            this.style.transform = '';
            alert('Redirecting to checkout... (This is a demo)');
          }, 200);
        });
      });
    });