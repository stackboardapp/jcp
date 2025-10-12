 var submitted = false;

    function validateEmail(event) {
      const emailInput = document.getElementById('usrnm').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput)) {
        alert("Please enter a valid email address.");
        return false;
      }
      submitted = true;
      return true;
    }

    

        // Show modal after 5 seconds with countdown
        document.addEventListener('DOMContentLoaded', function() {
            let countdownElement = document.getElementById('countdown');
            let reopenBtn = document.getElementById('reopenModalBtn');
            let countdown = 5;
            
            // Update countdown every second
            let countdownInterval = setInterval(function() {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    countdownElement.style.display = 'none';
                }
            }, 1000);
            
            // Show modal after 5 seconds
            setTimeout(function() {
                var myModal = new bootstrap.Modal(document.getElementById('delayedModal'));
                myModal.show();
                
                // Show the reopen button after the modal appears
                reopenBtn.style.display = 'flex';
            }, 5000); // 5000 milliseconds = 5 seconds
            
            // Add event listener to reopen button
            reopenBtn.addEventListener('click', function() {
                var myModal = new bootstrap.Modal(document.getElementById('delayedModal'));
                myModal.show();
            });
            
            // Also show the reopen button if user closes modal early
            document.getElementById('delayedModal').addEventListener('hidden.bs.modal', function() {
                reopenBtn.style.display = 'flex';
            });
        });
