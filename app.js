(() => {
  const map = document.querySelector("#world-map");
  const mapFrame = document.querySelector(".map-frame");
  const status = document.querySelector("#map-status");
  const centerLabel = document.querySelector("#map-center");
  const rotationLabel = document.querySelector("#map-rotation");
  const resetButton = document.querySelector("#reset-button");
  const pointsContainer = document.querySelector("#poi-tabs");
  const dataUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
  let world;
  const angles = { longitude: 0, latitude: 0, rotation: 0 };
  const pointsOfInterest = [
    { name: "Null Island", longitude: 0, latitude: 0 },
    {
      name: "Point Nemo",
      longitude: -(123 + 23.6 / 60),
      latitude: -(48 + 52.6 / 60)
    }
  ];
  const angleLimits = {
    longitude: [-180, 180],
    latitude: [-90, 90],
    rotation: [-180, 180]
  };

  function formatCoordinate(value, positiveDirection, negativeDirection) {
    if (value === 0) return "0°";
    let degrees = Math.floor(Math.abs(value));
    let minutes = Math.round((Math.abs(value) - degrees) * 600) / 10;
    if (minutes === 60) {
      degrees += 1;
      minutes = 0;
    }
    const minuteLabel = minutes === 0 ? "" : ` ${minutes}′`;
    const direction = value < 0 ? negativeDirection : positiveDirection;
    return `${degrees}°${minuteLabel} ${direction}`;
  }

  function formatLongitude(longitude) {
    return formatCoordinate(longitude, "E", "W");
  }

  function formatLatitude(latitude) {
    return formatCoordinate(latitude, "N", "S");
  }

  function formatRotation(rotation) {
    if (rotation === 0) return "0°";
    return `${rotation > 0 ? "+" : "−"}${Math.abs(rotation)}°`;
  }

  function updateMapLabel() {
    const longitude = formatLongitude(angles.longitude);
    const latitude = formatLatitude(angles.latitude);
    const rotation = formatRotation(angles.rotation);
    centerLabel.textContent = `${longitude} / ${latitude}`;
    rotationLabel.textContent = rotation;
    for (const point of pointsOfInterest) {
      const button = pointsContainer.querySelector(`[data-point="${point.name}"]`);
      button.setAttribute("aria-pressed",
        String(angles.longitude === point.longitude && angles.latitude === point.latitude));
    }
    map.setAttribute("aria-label",
      `World map centered at ${longitude}, ${latitude}, rotated ${rotation} from north`);
  }

  function setAngles(changes) {
    Object.assign(angles, changes);
    for (const name of Object.keys(changes)) {
      document.querySelector(`#${name}-slider`).value = String(angles[name]);
      const numberInput = document.querySelector(`#${name}-number`);
      numberInput.value = String(angles[name]);
      numberInput.removeAttribute("aria-invalid");
    }
    updateMapLabel();
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
      .rotate([-angles.longitude, -angles.latitude, angles.rotation])
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

  for (const [name, [minimum, maximum]] of Object.entries(angleLimits)) {
    const slider = document.querySelector(`#${name}-slider`);
    const numberInput = document.querySelector(`#${name}-number`);
    slider.addEventListener("input", () => setAngles({ [name]: Number(slider.value) }));
    numberInput.addEventListener("input", () => {
      const value = numberInput.valueAsNumber;
      if (!Number.isFinite(value) || value < minimum || value > maximum) {
        numberInput.setAttribute("aria-invalid", "true");
        return;
      }
      setAngles({ [name]: value });
    });
    numberInput.addEventListener("change", () => {
      if (numberInput.getAttribute("aria-invalid") === "true") {
        setAngles({ [name]: angles[name] });
      }
    });
  }

  for (const point of pointsOfInterest) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "poi-tab";
    button.setAttribute("data-point", point.name);
    button.setAttribute("aria-pressed", "false");
    const name = document.createElement("span");
    name.className = "poi-name";
    name.textContent = point.name;
    const coordinates = document.createElement("span");
    coordinates.className = "poi-coordinates";
    coordinates.textContent = `${formatLatitude(point.latitude)} / ${formatLongitude(point.longitude)}`;
    button.append(name, coordinates);
    button.addEventListener("click", () => setAngles({
      longitude: point.longitude,
      latitude: point.latitude
    }));
    pointsContainer.append(button);
  }

  resetButton.addEventListener("click", () => {
    setAngles({ longitude: 0, latitude: 0, rotation: 0 });
  });
  updateMapLabel();

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
