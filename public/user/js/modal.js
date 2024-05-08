// Function to open the modal and set form action dynamically
function openModal(itemId) {
  // Get the modal corresponding to the item
  var modal = document.getElementById("myModal_" + itemId);
  // Set the form action dynamically
  var form = document.getElementById("removeForm_" + itemId);
  form.action = "/cartRemove/" + itemId;
  // Display the modal
  modal.style.display = "block";

  // Get the <span> element that closes the modal
  var closeButtons = modal.querySelectorAll(".close");

  // Loop through close buttons to attach event listeners
  closeButtons.forEach(function(closeButton) {
    closeButton.addEventListener("click", function() {
      modal.style.display = "none";
    });
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // When the user clicks the confirm button, handle confirmation
  var confirmButton = modal.querySelector("#confirmBtn");
  confirmButton.addEventListener("click", function() {
    // Add your confirmation logic here, such as removing the item
    // For demonstration purposes, let's just close the modal
    modal.style.display = "none";
  });
}

// Get all the buttons with class "remove-btn"
var removeButtons = document.querySelectorAll(".remove-btn");

// Loop through each button and attach a click event listener
removeButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    openModal(button.dataset.itemId);
  });
});
