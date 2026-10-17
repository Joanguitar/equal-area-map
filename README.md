# Equal Area

An interactive world map in the Mollweide equal-area projection. Drag the
longitude slider or enter a value from -180 to 180 to move the center of the
map.

## Run locally

Open `index.html` in a browser. The map and its geographic data load from
jsDelivr, so an internet connection is required.

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the site when changes are
pushed to `main` or when run manually. In the repository settings, set **Pages
> Build and deployment > Source** to **GitHub Actions**.

This repository is currently named `equal-area-map`, so its default Pages URL
is `https://joanguitar.github.io/equal-area-map/`. To publish at
`https://joanguitar.github.io/equal-area-maps/`, the GitHub repository must be
named `equal-area-maps` (or that URL must be configured as a custom domain).
