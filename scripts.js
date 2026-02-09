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
    const allDetails = Array.from(sideNav.querySelectorAll("details"));
    allDetails.forEach((details) => {
      details.open = details === parentDetails;
    });
  };

  if (window.location.hash) {
    const initialLink = sectionData.find(({ section }) =>
      `#${section.id}` === window.location.hash
    );
    if (initialLink) {
      setActiveLink(initialLink.link);
    }
  }

  const header = document.querySelector(".site-header");
  const getScrollOffset = () => {
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    return headerHeight + 24;
  };

  const getSectionTop = (section) =>
    section.getBoundingClientRect().top + window.scrollY;

  const findActiveLink = () => {
    const scrollPosition = window.scrollY + getScrollOffset();
    let activeLink = sectionData[0]?.link;
    sectionData.forEach(({ section, link }) => {
      if (getSectionTop(section) <= scrollPosition) {
        activeLink = link;
      }
    });
    return activeLink;
  };

  const updateActiveLink = () => {
    const activeLink = findActiveLink();
    if (activeLink) {
      setActiveLink(activeLink);
    }
  };

  let isTicking = false;
  const scheduleUpdate = () => {
    if (isTicking) {
      return;
    }
    isTicking = true;
    window.requestAnimationFrame(() => {
      updateActiveLink();
      isTicking = false;
    });
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("load", updateActiveLink);
  updateActiveLink();
});
