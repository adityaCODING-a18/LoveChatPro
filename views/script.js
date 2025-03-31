function togglePassword() {
    const input = document.getElementById("passwordInput");
    const icon = document.querySelector(".toggle-icon");

    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off"; // Change icon
    } else {
        input.type = "password";
        icon.textContent = "visibility"; // Change icon back
    }
}