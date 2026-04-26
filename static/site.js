// Shared frontend behaviour file.
// Handles:
// 1. nav active states
// 2. student/admin auth mode switching
// 3. societies/member directory filtering
// 4. student feed category filtering
(function () {
    // Shared nav highlighting for routed and generated preview pages.
    function normalisePath(path) {
        return (path || "/")
            .replace(/\/+$/, "")
            .replace(/\/\d+$/, "") || "/";
    }

    function setLinkActiveState(link, isActive, currentValue) {
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", currentValue);
        } else {
            link.removeAttribute("aria-current");
        }
    }

    var currentPath = normalisePath(window.location.pathname);
    document.querySelectorAll(".nav-links a").forEach(function (link) {
        var linkPath = normalisePath(link.getAttribute("href"));
        var requireExactMatch = link.getAttribute("data-nav-exact") === "true";
        var isHome = linkPath === "/";
        var isActive = requireExactMatch
            ? currentPath === linkPath
            : (isHome ? currentPath === "/" : currentPath === linkPath || currentPath.indexOf(linkPath + "/") === 0);
        setLinkActiveState(link, isActive, "page");
    });

    // Dashboard sidebar navs use in-page anchors, so keep the selected section highlighted.
    document.querySelectorAll(".dashboard-nav").forEach(function (nav) {
        var links = Array.from(nav.querySelectorAll("a"));
        var hashLinks = links.filter(function (link) {
            var href = link.getAttribute("href") || "";
            return href.charAt(0) === "#" && href.length > 1;
        });

        if (!hashLinks.length) {
            links.forEach(function (link) {
                var linkPath = normalisePath(link.getAttribute("href"));
                var isActive = currentPath === linkPath || currentPath.indexOf(linkPath + "/") === 0;
                setLinkActiveState(link, isActive, "page");
            });
            return;
        }

        var defaultLink = hashLinks.find(function (link) {
            return link.classList.contains("is-active");
        }) || hashLinks[0];
        var defaultHash = defaultLink ? defaultLink.getAttribute("href") : "";
        var observedSections = hashLinks.map(function (link) {
            var sectionId = (link.getAttribute("href") || "").slice(1);
            return sectionId ? document.getElementById(sectionId) : null;
        }).filter(Boolean);

        function syncHashNav(activeHash) {
            var selectedHash = hashLinks.some(function (link) {
                return link.getAttribute("href") === activeHash;
            }) ? activeHash : defaultHash;

            hashLinks.forEach(function (link) {
                setLinkActiveState(link, link.getAttribute("href") === selectedHash, "location");
            });
        }

        hashLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                syncHashNav(link.getAttribute("href"));
            });
        });

        window.addEventListener("hashchange", function () {
            syncHashNav(window.location.hash);
        });

        if ("IntersectionObserver" in window && observedSections.length) {
            var observer = new IntersectionObserver(function (entries) {
                var visibleEntries = entries.filter(function (entry) {
                    return entry.isIntersecting;
                });

                if (!visibleEntries.length) {
                    return;
                }

                visibleEntries.sort(function (entryA, entryB) {
                    return Math.abs(entryA.boundingClientRect.top) - Math.abs(entryB.boundingClientRect.top);
                });

                syncHashNav("#" + visibleEntries[0].target.id);
            }, {
                rootMargin: "-18% 0px -58% 0px",
                threshold: [0.2, 0.45, 0.7]
            });

            observedSections.forEach(function (section) {
                observer.observe(section);
            });
        }

        syncHashNav(window.location.hash || defaultHash);
    });

    // Registration role switcher for the student/admin register screen.
    document.querySelectorAll("[data-role-switcher]").forEach(function (switcher) {
        var buttons = Array.from(switcher.querySelectorAll("[data-role-target]"));
        var panels = Array.from(switcher.querySelectorAll("[data-role-panel]"));
        var defaultRole = switcher.getAttribute("data-default-role") || (buttons[0] && buttons[0].getAttribute("data-role-target"));

        function activate(role) {
            buttons.forEach(function (button) {
                var active = button.getAttribute("data-role-target") === role;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", active ? "true" : "false");
            });

            panels.forEach(function (panel) {
                panel.hidden = panel.getAttribute("data-role-panel") !== role;
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activate(button.getAttribute("data-role-target"));
            });
        });

        if (defaultRole) {
            activate(defaultRole);
        }
    });

    // Login role sync keeps the mock login form aligned with the selected path.
    document.querySelectorAll("[data-login-root]").forEach(function (root) {
        var buttons = Array.from(root.querySelectorAll("[data-login-role]"));
        var form = root.querySelector("[data-login-form]");
        var roleInput = root.querySelector("[data-login-role-input]");
        var registerLink = root.querySelector("[data-login-register]");
        var loginCopy = root.querySelector("[data-login-copy]");
        var studentPath = root.getAttribute("data-student-path") || "/student/";
        var adminPath = root.getAttribute("data-admin-path") || "/admin/";
        var studentRegisterPath = root.getAttribute("data-student-register-path") || "/register/";
        var adminRegisterPath = root.getAttribute("data-admin-register-path") || studentRegisterPath;
        var activeRole = root.getAttribute("data-default-role") || "student";

        function sync(role) {
            activeRole = role === "admin" ? "admin" : "student";

            buttons.forEach(function (button) {
                var isActive = button.getAttribute("data-login-role") === activeRole;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", isActive ? "true" : "false");
            });

            if (roleInput) {
                roleInput.value = activeRole;
            }

            if (form) {
                form.setAttribute("action", activeRole === "admin" ? adminPath : studentPath);
            }

            if (registerLink) {
                var registerLabel = activeRole === "admin"
                    ? registerLink.getAttribute("data-admin-register-label")
                    : registerLink.getAttribute("data-student-register-label");
                registerLink.setAttribute("href", activeRole === "admin" ? adminRegisterPath : studentRegisterPath);
                if (registerLabel) {
                    registerLink.textContent = registerLabel;
                }
            }

            if (loginCopy) {
                loginCopy.textContent = activeRole === "admin"
                    ? "Admin access opens the organiser dashboard, member tools, and society management pages."
                    : "Student access opens your profile, societies, and news feed.";
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                sync(button.getAttribute("data-login-role"));
            });
        });

        sync(activeRole);
    });

    // Shared search filtering for societies and the admin member directory.
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
        var input = root.querySelector("[data-filter-input]");
        var items = Array.from(root.querySelectorAll("[data-filter-item]"));
        var emptyState = root.querySelector("[data-filter-empty]");
        var count = root.querySelector("[data-filter-count]");
        var trigger = root.querySelector("[data-filter-trigger]");
        var queryParam = root.getAttribute("data-query-param");

        if (input && queryParam) {
            var params = new URLSearchParams(window.location.search);
            var initialValue = params.get(queryParam);
            if (initialValue) {
                input.value = initialValue;
            }
        }

        function render() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visibleCount = 0;

            items.forEach(function (item) {
                var text = (item.getAttribute("data-search-text") || item.textContent || "").toLowerCase();
                var match = !query || text.indexOf(query) !== -1;
                item.hidden = !match;
                if (match) {
                    visibleCount += 1;
                }
            });

            if (count) {
                count.textContent = String(visibleCount);
            }

            if (emptyState) {
                emptyState.hidden = items.length === 0 || visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", render);
            input.addEventListener("search", render);
        }

        if (trigger) {
            trigger.addEventListener("click", render);
        }

        render();
    });

    // News feed category and search filtering for the student My News page.
    document.querySelectorAll("[data-feed-root]").forEach(function (root) {
        var searchInput = root.querySelector("[data-feed-search]");
        var buttons = Array.from(root.querySelectorAll("[data-feed-filter]"));
        var items = Array.from(root.querySelectorAll("[data-feed-item]"));
        var emptyState = root.querySelector("[data-feed-empty]");
        var activeFilter = "all";

        function setActiveFilter(nextFilter) {
            activeFilter = nextFilter || "all";

            buttons.forEach(function (button) {
                var isActive = button.getAttribute("data-feed-filter") === activeFilter;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", isActive ? "true" : "false");
            });
        }

        // Show or hide each news card based on the selected category pill and search text.
        function renderFeed() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var visibleCount = 0;

            items.forEach(function (item) {
                var itemType = (item.getAttribute("data-feed-type") || "general").toLowerCase();
                var itemText = (item.getAttribute("data-search-text") || item.textContent || "").toLowerCase();
                var matchesFilter = activeFilter === "all" || itemType === activeFilter;
                var matchesQuery = !query || itemText.indexOf(query) !== -1;
                var isVisible = matchesFilter && matchesQuery;

                item.hidden = !isVisible;
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = items.length === 0 || visibleCount !== 0;
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                setActiveFilter(button.getAttribute("data-feed-filter"));
                renderFeed();
            });
        });

        if (searchInput) {
            searchInput.addEventListener("input", renderFeed);
            searchInput.addEventListener("search", renderFeed);
        }

        setActiveFilter(activeFilter);
        renderFeed();
    });
}());
