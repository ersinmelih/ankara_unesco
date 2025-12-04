
        // State
        let currentSlide = 0;
        const totalSlides = 8;
        let map;
        let advancedMarkers = {};
        
        // Coordinates
        const locations = {
            ulus: { lat: 39.9415, lng: 32.8540, zoom: 16 },
            sihhiye: { lat: 39.9250, lng: 32.8540, zoom: 15 },
            cankaya: { lat: 39.8900, lng: 32.8630, zoom: 16 },
            overview: { lat: 39.9150, lng: 32.8550, zoom: 13 }
        };

        const landmarks = [
            // Ulus
            { id: 'tbmm1', lat: 39.9414, lng: 32.8546, title: 'I. TBMM', type: 'ulus', icon: 'account_balance' },
            { id: 'tbmm2', lat: 39.9420, lng: 32.8533, title: 'II. TBMM', type: 'ulus', icon: 'account_balance' },
            { id: 'ankarapalas', lat: 39.9417, lng: 32.8530, title: 'Ankara Palas', type: 'ulus', icon: 'hotel' },
            { id: 'banks', lat: 39.9410, lng: 32.8540, title: 'Bankalar Cd.', type: 'ulus', icon: 'payments' },
            // Sıhhiye
            { id: 'ministries', lat: 39.9134, lng: 32.8516, title: 'Bakanlıklar', type: 'sihhiye', icon: 'gavel' },
            { id: 'guvenpark', lat: 39.9197, lng: 32.8529, title: 'Güvenpark', type: 'sihhiye', icon: 'park' },
            { id: 'opera', lat: 39.9329, lng: 32.8549, title: 'Opera Binası', type: 'sihhiye', icon: 'theater_comedy' },
            // Çankaya
            { id: 'cankaya_kosk', lat: 39.8900, lng: 32.8630, title: 'Pembe Köşk', type: 'cankaya', icon: 'villa' },
            { id: 'museum_kiosk', lat: 39.8890, lng: 32.8640, title: 'Müze Köşk', type: 'cankaya', icon: 'museum' }
        ];

        // Slide Logic
        function changeSlide(direction) {
            const nextSlide = currentSlide + direction;
            if (nextSlide >= 0 && nextSlide < totalSlides) {
                // Hide current
                document.getElementById(`slide-${currentSlide}`).classList.remove('active');
                
                // Show next
                currentSlide = nextSlide;
                document.getElementById(`slide-${currentSlide}`).classList.add('active');
                
                // Update UI
                updateProgressBar();
                handleMapState();
                
                // GSAP Animations for entering content
                const content = document.querySelector(`#slide-${currentSlide} .slide-content`);
                gsap.fromTo(content, {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.5, delay: 0.2});
            }
        }

        function updateProgressBar() {
            const percentage = ((currentSlide) / (totalSlides - 1)) * 100;
            document.getElementById('progressBar').style.width = `${percentage}%`;
            
            // Button visibility
            document.getElementById('btnPrev').style.opacity = currentSlide === 0 ? '0.5' : '1';
            document.getElementById('btnPrev').style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
            document.getElementById('btnNext').style.opacity = currentSlide === totalSlides - 1 ? '0.5' : '1';
        }

        async function initMap() {
            const { Map, InfoWindow } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
            const { Polyline } = await google.maps.importLibrary("maps");

            // Initialize Map
            // Use a temporary container or the first one available
            const mapEl = document.getElementById("map");
            
            map = new Map(mapEl, {
                center: locations.overview,
                zoom: locations.overview.zoom,
                mapId: 'ANKARA_UNESCO_MAP', // Demo ID
                disableDefaultUI: true,
                gestureHandling: 'greedy'
            });

            // Draw Atatürk Boulevard Axis (Approximate Line)
            const boulevardPath = [
                { lat: 39.9420, lng: 32.8533 }, // Ulus
                { lat: 39.9329, lng: 32.8549 }, // Opera
                { lat: 39.9197, lng: 32.8529 }, // Kizilay
                { lat: 39.9134, lng: 32.8516 }, // Bakanliklar
                { lat: 39.8900, lng: 32.8630 }  // Cankaya
            ];
            
            const axisLine = new Polyline({
                path: boulevardPath,
                geodesic: true,
                strokeColor: "#c5a47e",
                strokeOpacity: 0.8,
                strokeWeight: 6,
                map: map
            });

            // Create Markers
            landmarks.forEach(landmark => {
                // Create custom glyph
                const glyphContainer = document.createElement('div');
                glyphContainer.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px; color:white;">${landmark.icon}</span>`;
                
                const pin = new PinElement({
                    glyph: glyphContainer,
                    background: "#2c3e50",
                    borderColor: "#fff",
                    scale: 1.2
                });

                const marker = new AdvancedMarkerElement({
                    map,
                    position: { lat: landmark.lat, lng: landmark.lng },
                    content: pin.element,
                    title: landmark.title
                });

                // Simple InfoWindow
                const header = document.createElement('div');
                header.className = 'font-bold p-1';
                header.textContent = landmark.title;
                
                const iw = new InfoWindow({
                    headerContent: header,
                    content: `<div class="text-sm p-1">UNESCO Miras Noktası</div>`
                });

                marker.addListener('click', () => {
                    iw.open(map, marker);
                    map.panTo(marker.position);
                    map.setZoom(17);
                });

                advancedMarkers[landmark.id] = marker;
            });

            handleMapState(); // Initial check
        }

        // Moves the map DOM element to the active slide's visual container
        function handleMapState() {
            if (!map) return;

            const activeSlide = document.getElementById(`slide-${currentSlide}`);
            const mapViewType = activeSlide.dataset.mapView;
            const mapWrapper = document.getElementById('main-map-wrapper');
            
            // Identify where the map should go
            let targetContainer = null;

            if (mapViewType === 'ulus') targetContainer = document.getElementById('map-container-ulus');
            else if (mapViewType === 'sihhiye') targetContainer = document.getElementById('map-placeholder-sihhiye');
            else if (mapViewType === 'cankaya') targetContainer = document.getElementById('map-placeholder-cankaya');
            else if (mapViewType === 'overview') targetContainer = null; // Maybe show in a modal or specific div if needed, but for now specific slides use it.

            // Logic: If the current slide needs the map, we move the map Div into that slide.
            if (targetContainer) {
                mapWrapper.classList.remove('hidden');
                // Clear target and append map wrapper
                targetContainer.innerHTML = ''; 
                targetContainer.appendChild(mapWrapper);
                
                // Update Map View
                const loc = locations[mapViewType];
                map.panTo({ lat: loc.lat, lng: loc.lng });
                map.setZoom(loc.zoom);
                
            } else {
                // If slide doesn't use map, hide it to save resources or just keep it in memory
                mapWrapper.classList.add('hidden');
                document.body.appendChild(mapWrapper); // Move back to body to avoid deletion
            }
        }

        // Global function for clicking list items
        window.panToMarker = (id) => {
            if (advancedMarkers[id]) {
                const marker = advancedMarkers[id];
                map.panTo(marker.position);
                map.setZoom(18);
                // Trigger click to open IW
                google.maps.event.trigger(marker, 'click');
            }
        };

        // Keyboard Nav
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') changeSlide(1);
            if (e.key === 'ArrowLeft') changeSlide(-1);
        });

        // Initialize
        initMap();
        updateProgressBar();
    