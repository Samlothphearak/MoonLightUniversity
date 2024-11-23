//============ open the notification =================================================================
function openNotificationDetails(details) {
        // Show the modal with the notification details
        document.getElementById('notificationDetails').innerText = details;
        document.getElementById('notificationModal').classList.remove('hidden');
    }

    function closeNotificationDetails() {
        // Close the modal
        document.getElementById('notificationModal').classList.add('hidden');
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