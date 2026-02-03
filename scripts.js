const resetCopyButton = (button) => {
  button.classList.remove("is-copied");
  const defaultLabel = button.dataset.defaultLabel;
  if (defaultLabel) {
    button.setAttribute("aria-label", defaultLabel);
  }
};

const copySnippet = async (button, code) => {
  const text = code.innerText.trimEnd();
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  button.classList.add("is-copied");
  const copiedLabel = button.dataset.copiedLabel;
  if (copiedLabel) {
    button.setAttribute("aria-label", copiedLabel);
  }

  setTimeout(() => resetCopyButton(button), 2000);
};

document.addEventListener("DOMContentLoaded", () => {
  const codeBlocks = document.querySelectorAll(".code-block");
  codeBlocks.forEach((block) => {
    const button = block.querySelector(".copy-button");
    const code = block.querySelector("code");
    if (!button || !code) {
      return;
    }

    button.addEventListener("click", () => {
      copySnippet(button, code);
    });
  });
});
