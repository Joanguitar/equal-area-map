(() => {
  const map = document.querySelector("#world-map");
  const mapFrame = document.querySelector(".map-frame");
  const status = document.querySelector("#map-status");
  const centerLabel = document.querySelector("#map-center");
  const slider = document.querySelector("#longitude-slider");
  const numberInput = document.querySelector("#longitude-number");
  const resetButton = document.querySelector("#reset-button");
  const dataUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
  let world;
  let centerLongitude = 0;

  function formatLongitude(longitude) {
    if (longitude === 0) return "0°";
    return `${Math.abs(longitude)}° ${longitude < 0 ? "W" : "E"}`;
  }

  function setCenter(longitude) {
    centerLongitude = longitude;
    slider.value = String(longitude);
    numberInput.value = String(longitude);
    numberInput.removeAttribute("aria-invalid");
    centerLabel.textContent = formatLongitude(longitude);
    map.setAttribute("aria-label", `World map centered at longitude ${formatLongitude(longitude)}`);
    if (world) renderMap();
  }

  function renderMap() {
    const bounds = mapFrame.getBoundingClientRect();
    const width = Math.round(bounds.width);
    const height = Math.max(Math.round(width * 0.48), 205);
    if (width < 1 || height < 1) return;

    map.setAttribute("viewBox", `0 0 ${width} ${height}`);
    map.style.height = `${height}px`;

    const sphere = { type: "Sphere" };
    const projection = d3.geoMollweide()
      .rotate([-centerLongitude, 0, 0])
      .fitExtent([[16, 12], [width - 16, height - 12]], sphere);
    const path = d3.geoPath(projection);

    map.querySelector(".map-ocean").innerHTML = `<path d="${path(sphere)}"></path>`;
    map.querySelector(".map-graticule").innerHTML = `<path d="${path(d3.geoGraticule10())}"></path>`;
    map.querySelector(".map-land").innerHTML =
      `<path d="${path(topojson.feature(world, world.objects.land))}"></path>`;
    map.querySelector(".map-borders").innerHTML =
      `<path d="${path(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))}"></path>`;
    map.querySelector(".map-outline").innerHTML = `<path d="${path(sphere)}"></path>`;
  }

  function onNumberInput() {
    const value = numberInput.valueAsNumber;
    const valid = Number.isInteger(value) && value >= -180 && value <= 180;
    if (!valid) {
      numberInput.setAttribute("aria-invalid", "true");
      return;
    }
    setCenter(value);
  }

  slider.addEventListener("input", () => setCenter(Number(slider.value)));
  numberInput.addEventListener("input", onNumberInput);
  numberInput.addEventListener("change", () => {
    if (numberInput.getAttribute("aria-invalid") === "true") {
      numberInput.value = String(centerLongitude);
      numberInput.removeAttribute("aria-invalid");
    }
  });
  resetButton.addEventListener("click", () => setCenter(0));

  async function loadMap() {
    try {
      if (!window.d3 || !window.topojson) {
        throw new Error("The map libraries could not be loaded.");
      }
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`Map data request failed (${response.status}).`);
      }
      world = await response.json();
      if (!world.objects || !world.objects.land || !world.objects.countries) {
        throw new Error("The map data is missing the expected geographic features.");
      }
      status.textContent = "";
      renderMap();
      new ResizeObserver(renderMap).observe(mapFrame);
    } catch (error) {
      console.error("Unable to load the world map.", error);
      status.textContent = "The map could not load. Check your connection and refresh to try again.";
    }
  }

  loadMap();
})();
