# Equal Area

An interactive world map in the Mollweide equal-area projection. Set the center
longitude (-180 to 180) and latitude (-90 to 90), then rotate the map relative
to north (-180 to 180). Use the sliders, enter coordinates directly, or choose
a point of interest below the controls. Choosing a point changes the center but
keeps the map rotation. Reset returns all settings to zero.

To add another point of interest, add its name and longitude/latitude in
decimal degrees to the `pointsOfInterest` list in `app.js`.

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
