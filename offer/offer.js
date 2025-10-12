var submitted = false;

function validateEmail(event) {
  const emailInput = document.getElementById('usrnm');
  
  // Check if element exists
  if (!emailInput) {
    console.error('Email input element not found');
    return false;
  }
  
  const emailValue = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(emailValue)) {
    alert("Please enter a valid email address.");
    if (event) event.preventDefault();
    return false;
  }
  
  submitted = true;
  return true;
}

// Show modal after 5 seconds with countdown
document.addEventListener('DOMContentLoaded', function() {
  // Check if required elements exist
  const countdownElement = document.getElementById('countdown');
  const reopenBtn = document.getElementById('reopenModalBtn');
  const modalElement = document.getElementById('delayedModal');
  
  if (!countdownElement || !reopenBtn || !modalElement) {
    console.error('One or more required elements not found');
    return;
  }
  
  let countdown = 5;
  
  // Update countdown every second
  let countdownInterval = setInterval(function() {
    countdown--;
    if (countdownElement) {
      countdownElement.textContent = countdown;
    }
    
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      if (countdownElement) {
        countdownElement.style.display = 'none';
      }
    }
  }, 1000);
  
  // Show modal after 5 seconds
  setTimeout(function() {
    try {
      const myModal = new bootstrap.Modal(modalElement);
      myModal.show();
      
      // Show the reopen button after the modal appears
      reopenBtn.style.display = 'flex';
    } catch (error) {
      console.error('Error showing modal:', error);
    }
  }, 5000);
  
  // Add event listener to reopen button
  reopenBtn.addEventListener('click', function() {
    try {
      const myModal = new bootstrap.Modal(modalElement);
      myModal.show();
    } catch (error) {
      console.error('Error reopening modal:', error);
    }
  });
  
  // Also show the reopen button if user closes modal early
  modalElement.addEventListener('hidden.bs.modal', function() {
    reopenBtn.style.display = 'flex';
  });
});
