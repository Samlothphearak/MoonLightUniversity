//============ open the notification =================================================================
  // Function to show the notification modal with details
  function showNotificationDetails(title, message, date) {
    const modal = document.getElementById('notificationModal');
    const notificationDetails = document.getElementById('notificationDetails');

    // Format the notification details
    notificationDetails.innerHTML = `
        <strong>${title}</strong><br>
        <p>${message}</p>
        <span class="text-xs text-gray-500">${new Date(date).toLocaleString()}</span>
    `;

    // Display the modal
    modal.classList.remove('hidden');
}

// Function to close the notification modal
function closeNotificationDetails() {
    const modal = document.getElementById('notificationModal');
    modal.classList.add('hidden');
}
 //===================Open profile picture modal===================
 function openProfilePicture(imageSrc) {
    const modal = document.getElementById('profileModal');
    const modalImage = document.getElementById('modalProfilePicture');
    modalImage.src = imageSrc; // Set the source of the image in the modal
    modal.classList.remove('hidden'); // Show the modal
}

// Close profile picture modal
function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.add('hidden'); // Hide the modal
}