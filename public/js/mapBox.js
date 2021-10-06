
export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidXNhbWF3enIiLCJhIjoiY2t1MTFrZ3pjMHlocjJvcGN3ejVnanhpNyJ9.9q55-Owk-BQKj4OiKbfxIA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/usamawzr/ckty1p4kp1nfn17lfvzzl97ia',
        scrollZoom: false
        // center: [-118.1113491, 34.111745],
        // zoom: 10,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        //Create Marker
        const el = document.createElement('div');
        el.className = 'marker';

        //Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        //Add Popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

        //Extend map bounds to include current Location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            right: 100,
            left: 100
        }
    });
};