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

  const sideNav = document.querySelector(".side-nav");
  if (!sideNav) {
    return;
  }

  const navLinks = Array.from(sideNav.querySelectorAll("a[href^='#']"));
  const sectionData = navLinks
    .map((link) => {
      const targetId = link.getAttribute("href")?.slice(1);
      if (!targetId) {
        return null;
      }
      const section = document.getElementById(targetId);
      if (!section) {
        return null;
      }
      return { link, section };
    })
    .filter(Boolean);

  if (!sectionData.length) {
    return;
  }

  const setActiveLink = (activeLink) => {
    sectionData.forEach(({ link }) => {
      link.classList.toggle("is-active", link === activeLink);
      if (link === activeLink) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const parentDetails = activeLink?.closest("details");
    if (parentDetails) {
      parentDetails.open = true;
    }
  };

  if (window.location.hash) {
    const initialLink = sectionData.find(({ section }) =>
      `#${section.id}` === window.location.hash
    );
    if (initialLink) {
      setActiveLink(initialLink.link);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const match = sectionData.find(({ section }) => section === entry.target);
        if (match) {
          setActiveLink(match.link);
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0.1,
    }
  );

  sectionData.forEach(({ section }) => {
    observer.observe(section);
  });
});
