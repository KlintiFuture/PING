const html = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const logoImage = document.querySelector(".brand img");
const clock = document.querySelector("#clock");
const pingForm = document.querySelector("#pingForm");
const pingMetrics = document.querySelector("#pingMetrics");
const pingOutput = document.querySelector("#pingOutput");
const pingStatus = document.querySelector("#pingStatus");
const subnetForm = document.querySelector("#subnetForm");
const cidrInput = document.querySelector("#cidrInput");
const subnetResults = document.querySelector("#subnetResults");
const macForm = document.querySelector("#macForm");
const macInput = document.querySelector("#macInput");
const macResults = document.querySelector("#macResults");
const toolLinks = document.querySelectorAll("[data-tool-link]");
const toolPanels = document.querySelectorAll("[data-tool-panel]");

const toolPaths = {
  ping: "/ping",
  subnet: "/subnet",
  mac: "/mac-lookup"
};

const toolByPath = {
  "/": "ping",
  "/ping": "ping",
  "/subnet": "subnet",
  "/mac-lookup": "mac"
};

const toolTitles = {
  ping: "Ping Network | Ping IP",
  subnet: "Ping Network | Subnets & Hosts",
  mac: "Ping Network | MAC Lookup"
};

const macProfiles = new Map([
  ["00000C", { vendor: "Cisco Systems", deviceType: "Router, switch, or access point" }],
  ["000085", { vendor: "Canon", deviceType: "Printer or imaging device" }],
  ["0000AA", { vendor: "Xerox", deviceType: "Printer or office device" }],
  ["000569", { vendor: "VMware", deviceType: "Virtual machine" }],
  ["00095B", { vendor: "NETGEAR", deviceType: "Router, switch, or wireless access point" }],
  ["000C29", { vendor: "VMware", deviceType: "Virtual machine" }],
  ["001422", { vendor: "Dell", deviceType: "Workstation, laptop, or server" }],
  ["00155D", { vendor: "Microsoft", deviceType: "Hyper-V virtual machine" }],
  ["00163E", { vendor: "Xensource", deviceType: "Xen virtual machine" }],
  ["0017F2", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["0019E3", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["001A4B", { vendor: "Hewlett Packard", deviceType: "Printer, workstation, or server" }],
  ["001B21", { vendor: "Intel", deviceType: "PC, laptop, or server network adapter" }],
  ["001B63", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["001C14", { vendor: "VMware", deviceType: "Virtual machine" }],
  ["001D4F", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["001E67", { vendor: "Intel", deviceType: "PC, laptop, or server network adapter" }],
  ["001EC2", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["001F5B", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["00216A", { vendor: "Intel", deviceType: "PC, laptop, or server network adapter" }],
  ["0021E9", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["002241", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["002312", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["002332", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["0024D7", { vendor: "Intel", deviceType: "PC, laptop, or server network adapter" }],
  ["002500", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["002608", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["005056", { vendor: "VMware", deviceType: "Virtual machine" }],
  ["008077", { vendor: "Brother", deviceType: "Printer or office device" }],
  ["0242AC", { vendor: "Docker", deviceType: "Container bridge interface" }],
  ["080027", { vendor: "Oracle VirtualBox", deviceType: "Virtual machine" }],
  ["20C9D0", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["24A43C", { vendor: "Ubiquiti", deviceType: "Router, switch, or wireless access point" }],
  ["28CFE9", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["3C2C30", { vendor: "Dell", deviceType: "Workstation, laptop, or server" }],
  ["3C5282", { vendor: "Hewlett Packard", deviceType: "Printer, workstation, or server" }],
  ["3C5AB4", { vendor: "Google", deviceType: "Phone, smart speaker, or streaming device" }],
  ["3C7A8A", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["3CFDFE", { vendor: "Intel", deviceType: "PC, laptop, or server network adapter" }],
  ["40A6D9", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["44D9E7", { vendor: "Ubiquiti", deviceType: "Router, switch, or wireless access point" }],
  ["501AC5", { vendor: "Microsoft", deviceType: "Surface, Xbox, or Windows endpoint" }],
  ["50C7BF", { vendor: "TP-Link", deviceType: "Router, switch, or wireless access point" }],
  ["525400", { vendor: "QEMU/KVM", deviceType: "Virtual machine" }],
  ["68D93C", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["7483C2", { vendor: "Ubiquiti", deviceType: "Router, switch, or wireless access point" }],
  ["788A20", { vendor: "Ubiquiti", deviceType: "Router, switch, or wireless access point" }],
  ["7CD1C3", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["84A134", { vendor: "Hewlett Packard", deviceType: "Printer, workstation, or server" }],
  ["A040A0", { vendor: "NETGEAR", deviceType: "Router, switch, or wireless access point" }],
  ["A45E60", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["B827EB", { vendor: "Raspberry Pi", deviceType: "Single-board computer or IoT device" }],
  ["B4B52F", { vendor: "Hewlett Packard", deviceType: "Printer, workstation, or server" }],
  ["C4E984", { vendor: "TP-Link", deviceType: "Router, switch, or wireless access point" }],
  ["D03E5C", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["D4BED9", { vendor: "Dell", deviceType: "Workstation, laptop, or server" }],
  ["D80D17", { vendor: "TP-Link", deviceType: "Router, switch, or wireless access point" }],
  ["D83ADD", { vendor: "Raspberry Pi", deviceType: "Single-board computer or IoT device" }],
  ["DCA632", { vendor: "Raspberry Pi", deviceType: "Single-board computer or IoT device" }],
  ["DC9FDB", { vendor: "Ubiquiti", deviceType: "Router, switch, or wireless access point" }],
  ["E45F01", { vendor: "Raspberry Pi", deviceType: "Single-board computer or IoT device" }],
  ["E848B8", { vendor: "TP-Link", deviceType: "Router, switch, or wireless access point" }],
  ["F01898", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["F09FC2", { vendor: "Ubiquiti", deviceType: "Router, switch, or wireless access point" }],
  ["F4F26D", { vendor: "TP-Link", deviceType: "Router, switch, or wireless access point" }],
  ["F81EDF", { vendor: "Apple", deviceType: "Mac, iPhone, iPad, or Apple endpoint" }],
  ["F8B156", { vendor: "Dell", deviceType: "Workstation, laptop, or server" }]
]);

function setTheme(theme) {
  html.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
  logoImage.src = theme === "dark" ? "/assets/logo-dark.svg" : "/assets/logo.svg";
  localStorage.setItem("pingNetworkTheme", theme);
}

function currentToolFromPath() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return toolByPath[path] || "ping";
}

function setActiveTool(tool, options = {}) {
  const activeTool = toolPaths[tool] ? tool : "ping";

  toolPanels.forEach(panel => {
    const isActive = panel.dataset.toolPanel === activeTool;
    panel.classList.toggle("is-active", isActive);
    panel.toggleAttribute("hidden", !isActive);
  });

  toolLinks.forEach(link => {
    const isActive = link.dataset.toolLink === activeTool;
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.title = toolTitles[activeTool];

  if (options.updateUrl) {
    const method = options.replace ? "replaceState" : "pushState";
    window.history[method]({}, "", toolPaths[activeTool]);
  }
}

function formatClock() {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  clock.textContent = formatter.format(new Date());
}

function normalizeMac(input) {
  const clean = input.trim().replace(/[.:-]/g, "").toUpperCase();

  if (!/^[0-9A-F]{12}$/.test(clean)) {
    throw new Error("Enter a 12-digit MAC address, for example A4:5E:60:12:34:56.");
  }

  return clean;
}

function formatMac(clean) {
  return clean.match(/.{2}/g).join(":");
}

function lookupMac(input) {
  const clean = normalizeMac(input);
  const firstByte = Number.parseInt(clean.slice(0, 2), 16);
  const oui = clean.slice(0, 6);
  const isBroadcast = clean === "FFFFFFFFFFFF";
  const isMulticast = (firstByte & 1) === 1;
  const isLocal = (firstByte & 2) === 2;
  const profile = macProfiles.get(oui);
  const addressClass = isBroadcast
    ? "Broadcast address"
    : isMulticast
      ? "Multicast or group address"
      : isLocal
        ? "Locally administered or randomized"
        : "Globally unique vendor assigned";

  if (isBroadcast) {
    return {
      normalized: formatMac(clean),
      oui: "FF:FF:FF",
      vendor: "Broadcast",
      deviceType: "Network broadcast address",
      addressClass,
      confidence: "High",
      note: "This is not a physical device. It targets every host on the local broadcast domain."
    };
  }

  if (clean.startsWith("01005E")) {
    return {
      normalized: formatMac(clean),
      oui: "01:00:5E",
      vendor: "IANA IPv4 multicast",
      deviceType: "IPv4 multicast group address",
      addressClass,
      confidence: "High",
      note: "This is a multicast destination, not a single endpoint device."
    };
  }

  if (clean.startsWith("3333")) {
    return {
      normalized: formatMac(clean),
      oui: "33:33",
      vendor: "IPv6 multicast",
      deviceType: "IPv6 multicast group address",
      addressClass,
      confidence: "High",
      note: "This is a multicast destination, not a single endpoint device."
    };
  }

  if (clean.startsWith("0180C2")) {
    return {
      normalized: formatMac(clean),
      oui: "01:80:C2",
      vendor: "IEEE 802 control",
      deviceType: "Bridge, spanning-tree, or link-layer control",
      addressClass,
      confidence: "High",
      note: "This address is reserved for network control traffic."
    };
  }

  if (profile) {
    return {
      normalized: formatMac(clean),
      oui: formatMac(oui),
      vendor: profile.vendor,
      deviceType: profile.deviceType,
      addressClass,
      confidence: "High",
      note: "Matched against the bundled OUI profile. The exact model still needs inventory data or a network scan."
    };
  }

  if (clean.startsWith("0242")) {
    return {
      normalized: formatMac(clean),
      oui: formatMac(oui),
      vendor: "Docker or container runtime",
      deviceType: "Container bridge interface",
      addressClass,
      confidence: "Medium",
      note: "This pattern is commonly generated for container networking."
    };
  }

  if (isMulticast) {
    return {
      normalized: formatMac(clean),
      oui: formatMac(oui),
      vendor: "Multicast or group",
      deviceType: "Group destination address",
      addressClass,
      confidence: "Medium",
      note: "This does not identify a single endpoint device."
    };
  }

  if (isLocal) {
    return {
      normalized: formatMac(clean),
      oui: formatMac(oui),
      vendor: "Private or randomized",
      deviceType: "Phone, laptop, VM, or container using a private MAC",
      addressClass,
      confidence: "Medium",
      note: "The local bit is set, so the real hardware vendor is intentionally hidden or generated by software."
    };
  }

  return {
    normalized: formatMac(clean),
    oui: formatMac(oui),
    vendor: "Unknown vendor",
    deviceType: "Unknown endpoint type",
    addressClass,
    confidence: "Low",
    note: "No bundled OUI profile matched this prefix. Use an authoritative OUI feed for full vendor coverage."
  };
}

function renderMac(input) {
  try {
    const result = lookupMac(input);
    macResults.innerHTML = `
      <div class="result-item">
        <span>Device Type</span>
        <strong>${result.deviceType}</strong>
      </div>
      <div class="result-item">
        <span>Vendor</span>
        <strong>${result.vendor}</strong>
      </div>
      <div class="result-item">
        <span>Normalized</span>
        <strong>${result.normalized}</strong>
      </div>
      <div class="result-item">
        <span>OUI Prefix</span>
        <strong>${result.oui}</strong>
      </div>
      <div class="result-item">
        <span>Address Class</span>
        <strong>${result.addressClass}</strong>
      </div>
      <div class="result-item">
        <span>Confidence</span>
        <strong>${result.confidence}</strong>
      </div>
      <div class="result-item is-wide">
        <span>Lookup Note</span>
        <strong>${result.note}</strong>
      </div>
    `;
  } catch (error) {
    macResults.innerHTML = `
      <div class="result-item is-wide">
        <span>Input Error</span>
        <strong class="error-text">${error.message}</strong>
      </div>
    `;
  }
}

function setMetrics(items) {
  pingMetrics.innerHTML = items.map(item => `
    <div>
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("");
}

function ipToInt(ip) {
  const octets = ip.split(".");
  if (octets.length !== 4) {
    throw new Error("Enter an IPv4 address with four octets.");
  }

  return octets.reduce((value, octet) => {
    if (!/^\d+$/.test(octet)) {
      throw new Error("IPv4 octets must be numbers.");
    }

    const number = Number(octet);
    if (number < 0 || number > 255) {
      throw new Error("IPv4 octets must be between 0 and 255.");
    }

    return ((value << 8) + number) >>> 0;
  }, 0);
}

function intToIp(value) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ].join(".");
}

function prefixToMask(prefix) {
  if (prefix === 0) {
    return 0;
  }

  return (0xffffffff << (32 - prefix)) >>> 0;
}

function classifyIp(ipInt) {
  const first = (ipInt >>> 24) & 255;
  const second = (ipInt >>> 16) & 255;

  if (first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168)) {
    return "Private";
  }

  if (first === 127) {
    return "Loopback";
  }

  if (first === 169 && second === 254) {
    return "Link-local";
  }

  if (first >= 224 && first <= 239) {
    return "Multicast";
  }

  if (first >= 240) {
    return "Reserved";
  }

  return "Public";
}

function calculateSubnet(cidr) {
  const clean = cidr.trim();
  const match = clean.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d|[1-2]\d|3[0-2])$/);

  if (!match) {
    throw new Error("Use IPv4 CIDR format, for example 192.168.10.42/24.");
  }

  const ip = match[1];
  const prefix = Number(match[2]);
  const ipInt = ipToInt(ip);
  const mask = prefixToMask(prefix);
  const wildcard = (~mask) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = prefix <= 30 ? Math.max(0, totalAddresses - 2) : totalAddresses;
  const firstHost = prefix <= 30 ? network + 1 : network;
  const lastHost = prefix <= 30 ? broadcast - 1 : broadcast;
  const hostOffset = ipInt - network;
  const position = totalAddresses > 1 ? Math.round((hostOffset / (totalAddresses - 1)) * 100) : 100;

  return {
    inputIp: ip,
    prefix,
    mask: intToIp(mask),
    wildcard: intToIp(wildcard),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(firstHost >>> 0),
    lastHost: intToIp(lastHost >>> 0),
    totalAddresses: totalAddresses.toLocaleString(),
    usableHosts: usableHosts.toLocaleString(),
    type: classifyIp(ipInt),
    position
  };
}

function renderSubnet(cidr) {
  try {
    const result = calculateSubnet(cidr);
    subnetResults.innerHTML = `
      <div class="result-item">
        <span>Network</span>
        <strong>${result.network}/${result.prefix}</strong>
      </div>
      <div class="result-item">
        <span>Subnet Mask</span>
        <strong>${result.mask}</strong>
      </div>
      <div class="result-item">
        <span>First Host</span>
        <strong>${result.firstHost}</strong>
      </div>
      <div class="result-item">
        <span>Last Host</span>
        <strong>${result.lastHost}</strong>
      </div>
      <div class="result-item">
        <span>Broadcast</span>
        <strong>${result.broadcast}</strong>
      </div>
      <div class="result-item">
        <span>Usable Hosts</span>
        <strong>${result.usableHosts}</strong>
      </div>
      <div class="result-item">
        <span>Total Addresses</span>
        <strong>${result.totalAddresses}</strong>
      </div>
      <div class="result-item">
        <span>Wildcard</span>
        <strong>${result.wildcard}</strong>
      </div>
      <div class="result-item is-wide">
        <span>Range Position</span>
        <strong>${result.inputIp} is ${result.type}</strong>
        <div class="range-bar" style="--position: ${result.position}%"></div>
      </div>
    `;
  } catch (error) {
    subnetResults.innerHTML = `
      <div class="result-item is-wide">
        <span>Input Error</span>
        <strong class="error-text">${error.message}</strong>
      </div>
    `;
  }
}

async function handlePing(event) {
  event.preventDefault();
  const submitButton = pingForm.querySelector("button[type='submit']");
  const formData = new FormData(pingForm);
  const payload = {
    target: formData.get("target"),
    count: formData.get("count"),
    timeout: formData.get("timeout")
  };

  submitButton.disabled = true;
  pingStatus.classList.remove("is-live", "is-error");
  pingOutput.textContent = `Pinging ${payload.target}...`;
  setMetrics([
    { label: "Status", value: "Running" },
    { label: "Average", value: "-" },
    { label: "Loss", value: "-" }
  ]);

  try {
    const response = await fetch("/api/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Ping request failed.");
    }

    pingStatus.classList.toggle("is-live", data.ok);
    pingStatus.classList.toggle("is-error", !data.ok);
    setMetrics([
      { label: "Status", value: data.ok ? "Reachable" : "Unreachable" },
      { label: "Average", value: typeof data.avgMs === "number" ? `${data.avgMs} ms` : "-" },
      { label: "Loss", value: typeof data.lossPercent === "number" ? `${data.lossPercent}%` : "-" }
    ]);
    pingOutput.textContent = data.raw || "No ping output returned.";
  } catch (error) {
    pingStatus.classList.add("is-error");
    setMetrics([
      { label: "Status", value: "Error" },
      { label: "Average", value: "-" },
      { label: "Loss", value: "-" }
    ]);
    pingOutput.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}

const savedTheme = localStorage.getItem("pingNetworkTheme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
setTheme(savedTheme || preferredTheme);
formatClock();
setInterval(formatClock, 1000);
renderSubnet(cidrInput.value);
renderMac(macInput.value);
setActiveTool(currentToolFromPath());

if (!toolByPath[window.location.pathname.replace(/\/$/, "") || "/"]) {
  setActiveTool("ping", { updateUrl: true, replace: true });
}

themeToggle.addEventListener("click", () => {
  setTheme(html.dataset.theme === "dark" ? "light" : "dark");
});

toolLinks.forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    setActiveTool(link.dataset.toolLink, { updateUrl: true });
  });
});

window.addEventListener("popstate", () => {
  setActiveTool(currentToolFromPath());
});

pingForm.addEventListener("submit", handlePing);

subnetForm.addEventListener("submit", event => {
  event.preventDefault();
  renderSubnet(cidrInput.value);
});

document.querySelectorAll("[data-cidr]").forEach(button => {
  button.addEventListener("click", () => {
    cidrInput.value = button.dataset.cidr;
    renderSubnet(cidrInput.value);
  });
});

macForm.addEventListener("submit", event => {
  event.preventDefault();
  renderMac(macInput.value);
});

document.querySelectorAll("[data-mac]").forEach(button => {
  button.addEventListener("click", () => {
    macInput.value = button.dataset.mac;
    renderMac(macInput.value);
  });
});
