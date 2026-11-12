// Variable globale pour stocker la couche GeoJSON active
window.geoJsonLayerInstance = null;

function initLeafletMap(containerId, correctAnswer, onCountryClickCallback, revealTargetKey = null) {
    const countryKey = String(correctAnswer || 'fr').toLowerCase().trim();
    const revealKey = revealTargetKey ? String(revealTargetKey).toLowerCase().trim() : null;

    // Si la carte existe déjà et qu'on est en mode révélation, on met juste à jour les couleurs sans la détruire !
    if (window.mapInstance && revealKey) {
        if (window.geoJsonLayerInstance) {
            window.geoJsonLayerInstance.setStyle(function(feature) {
                const isTheTarget = matchesTarget(feature.properties, revealKey);
                if (isTheTarget) {
                    return {
                        fillColor: '#2e9d5b',
                        weight: 1.5,
                        color: '#2e9d5b',
                        fillOpacity: 0.9
                    };
                }
                return {
                    fillColor: '#dcdcdc',
                    weight: 1,
                    color: '#bdbdbd',
                    fillOpacity: 0.8
                };
            });
        }
        return;
    }

    if (window.mapInstance) {
        try {
            window.mapInstance.off();
            window.mapInstance.remove();
        } catch (e) {}
        window.mapInstance = null;
    }

    const worldBounds = L.latLngBounds(
        L.latLng(-70, -140),
        L.latLng(75, 140)
    );

    const map = L.map(containerId, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 5,
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: true,
        attributionControl: false,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0
    });

    window.mapInstance = map;

    function matchesTarget(properties, target) {
        if (!properties || !target) return false;
        const p = properties;
        const targetClean = String(target).toLowerCase().trim();
        
        const candidates = [
            p.ISO_A2, p.iso_a2, p.ISO2, p.wb_a2,
            p.ISO_A3, p.iso_a3, p.ADM0_A3, p.su_a3,
            p.ADMIN, p.name, p.NAME
        ].filter(Boolean).map(val => String(val).toLowerCase().trim());

        return candidates.some(c => c === targetClean);
    }

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(data => {
            window.geoJsonLayerInstance = L.geoJson(data, {
                noWrap: true,
                style: function(feature) {
                    const isTheTarget = matchesTarget(feature.properties, revealKey || countryKey);
                    
                    if (revealKey && isTheTarget) {
                        return {
                            fillColor: '#2e9d5b',
                            weight: 1.5,
                            color: '#2e9d5b',
                            fillOpacity: 0.9
                        };
                    }

                    return {
                        fillColor: '#dcdcdc',
                        weight: 1,
                        color: '#bdbdbd',
                        fillOpacity: 0.8
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mouseover: (e) => {
                            if (window.isGameAnswered && window.isGameAnswered()) return;
                            e.target.setStyle({
                                fillColor: '#FF8716',
                                fillOpacity: 0.9,
                                color: '#FF8716'
                            });
                        },
                        mouseout: (e) => {
                            if (window.isGameAnswered && window.isGameAnswered()) return;
                            const isRevealed = revealKey && matchesTarget(feature.properties, revealKey);
                            e.target.setStyle({
                                fillColor: isRevealed ? '#2e9d5b' : '#dcdcdc',
                                fillOpacity: isRevealed ? 0.9 : 0.8,
                                color: isRevealed ? '#2e9d5b' : '#bdbdbd'
                            });
                        },
                        click: () => {
                            if (window.isGameAnswered && window.isGameAnswered()) return;
                            const props = feature.properties || {};
                            const iso = String(props.ISO_A2 || props.iso_a2 || props.ISO2 || countryKey).toLowerCase().trim();
                            onCountryClickCallback(iso);
                        }
                    });
                }
            }).addTo(map);

            setTimeout(() => {
                map.invalidateSize();
            }, 50);
        })
        .catch(err => console.error("Erreur chargement frontières GeoJSON:", err));
}