// =====================================
// LANDING PAGE
// =====================================

const enterButton =
    document.querySelector(".enter-button");


if (enterButton) {

    enterButton.addEventListener("click", () => {

        enterButton.disabled = true;

        enterButton.style.pointerEvents = "none";

        window.location.href = "/chat.html";

    });

}