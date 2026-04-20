(function () {
    function normalisePath(path) {
        return (path || "/")
            .replace(/\/+$/, "")
            .replace(/\/\d+$/, "") || "/";
    }

    var currentPath = normalisePath(window.location.pathname);
    document.querySelectorAll(".nav-links a, .dashboard-nav a").forEach(function (link) {
        var linkPath = normalisePath(link.getAttribute("href"));
        var isHome = linkPath === "/";
        var isActive = isHome ? currentPath === "/" : currentPath === linkPath || currentPath.indexOf(linkPath + "/") === 0;
        if (isActive) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }
    });

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
                emptyState.hidden = visibleCount !== 0;
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

    document.querySelectorAll("[data-toggle-target]").forEach(function (button) {
        var targetId = button.getAttribute("data-toggle-target");
        var target = targetId ? document.getElementById(targetId) : null;
        if (!target) {
            return;
        }

        function syncLabel() {
            var expanded = !target.hidden;
            var openLabel = button.getAttribute("data-label-open");
            var closedLabel = button.getAttribute("data-label-closed");
            button.setAttribute("aria-expanded", expanded ? "true" : "false");
            if (expanded && openLabel) {
                button.textContent = openLabel;
            } else if (!expanded && closedLabel) {
                button.textContent = closedLabel;
            }
        }

        button.addEventListener("click", function () {
            target.hidden = !target.hidden;
            syncLabel();
        });

        syncLabel();
    });
}());
