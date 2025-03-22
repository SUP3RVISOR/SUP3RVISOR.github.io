async function loadDogs() {
    try {
        // Get the CSV content directly
        const response = await fetch('Data/Dogs_Cleaned.csv');
        const data = await response.text();
        
        // Parse CSV
        const rows = data.split('\n').filter(row => row.trim() !== ''); // Remove empty lines
        const headers = rows[0].split(',');
        
        // Find the correct column indices
        const link1Index = headers.findIndex(h => h === 'link1');
        const link2Index = headers.findIndex(h => h === 'link2');
        const link3Index = headers.findIndex(h => h === 'link3');

        const dogs = rows.slice(1).map(row => {
            // Split by comma but respect quotes
            const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return {
                breed: values[0].replace(/"/g, ''),
                description: values[1].replace(/"/g, ''),
                temperament: values[2].replace(/"/g, ''),
                popularity: values[3],
                minHeight: values[4],
                maxHeight: values[5],
                minWeight: values[6],
                maxWeight: values[7],
                minLife: values[8],
                maxLife: values[9],
                link1: values[21]?.replace(/"/g, '').trim() || '',
                link2: values[22]?.replace(/"/g, '').trim() || '',
                link3: values[23]?.replace(/"/g, '').trim() || ''
            };
        });

        console.log('Parsed dogs:', dogs); // Debug log
        window.allDogs = dogs; // Store all dogs in a global variable
        displayDogs(dogs);
        setupSearch();
        setupModal();
        setupHeaderSearch();
    } catch (error) {
        console.error('Error loading dogs:', error);
        document.querySelector('.dogs-container').innerHTML = 
            '<p style="color: red;">Error loading dogs data. Please check the console for details.</p>';
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredDogs = window.allDogs.filter(dog => 
            dog.breed.toLowerCase().includes(searchTerm)
        );
        displayDogs(filteredDogs);
    });
}

function setupModal() {
    const modal = document.getElementById('dogModal');
    const closeButton = document.querySelector('.close-button');

    closeButton.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function showDogDetails(dog) {
    const modal = document.getElementById('dogModal');
    
    // Set modal content
    document.getElementById('modalImage').src = dog.link1;
    document.getElementById('modalTitle').textContent = dog.breed;
    
    // Get the modal info container
    const modalInfo = document.querySelector('.modal-info');
    
    // Create the entire modal content
    modalInfo.innerHTML = `
        <div class="description-container">
            <p id="dogDescription">${dog.description}</p>
            <button class="show-more-btn">Show More</button>
        </div>
        <div class="stats-grid">
            <div class="stat-item">
                <i class="fas fa-ruler-vertical"></i>
                <h4>Height</h4>
                <p>${dog.minHeight} - ${dog.maxHeight} cm</p>
            </div>
            <div class="stat-item">
                <i class="fas fa-weight"></i>
                <h4>Weight</h4>
                <p>${dog.minWeight} - ${dog.maxWeight} kg</p>
            </div>
            <div class="stat-item">
                <i class="fas fa-heart"></i>
                <h4>Life Expectancy</h4>
                <p>${dog.minLife} - ${dog.maxLife} years</p>
            </div>
            <div class="stat-item">
                <i class="fas fa-star"></i>
                <h4>Popularity</h4>
                <p>${dog.popularity ? `Rank #${dog.popularity}` : 'Not ranked'}</p>
            </div>
        </div>
        <div class="characteristics">
            <h3>Characteristics</h3>
            <div class="temperament-tags">
                ${dog.temperament
                    .split(',')
                    .map(trait => `<span class="temperament-tag">${trait.trim()}</span>`)
                    .join('')}
            </div>
        </div>
    `;

    // Setup show more functionality after content is added
    const description = document.getElementById('dogDescription');
    const showMoreBtn = modalInfo.querySelector('.show-more-btn');
    
    // Check if show more is needed
    setTimeout(() => {
        if (description.scrollHeight > description.clientHeight) {
            description.classList.add('truncated');
            showMoreBtn.classList.add('visible');
            
            // Add click event listener
            showMoreBtn.addEventListener('click', () => {
                description.classList.toggle('expanded');
                description.classList.toggle('truncated');
                showMoreBtn.textContent = description.classList.contains('expanded') ? 'Show Less' : 'Show More';
            });
        } else {
            showMoreBtn.style.display = 'none';
        }
    }, 10);

    modal.style.display = "block";
}

function displayDogs(dogs) {
    const container = document.querySelector('.dogs-container');
    container.innerHTML = ''; // Clear any existing content
    
    if (!dogs || dogs.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No dogs found matching your search.</p>';
        return;
    }

    dogs.forEach(dog => {
        console.log('Processing dog:', dog); // Debug log

        let imageUrl = 'https://place-hold.it/300x200/gray/white&text=No%20Image';
        
        // Try each link in order
        if (dog.link1 && dog.link1 !== 'No image found') {
            imageUrl = dog.link1;
        } else if (dog.link2 && dog.link2 !== 'No image found') {
            imageUrl = dog.link2;
        } else if (dog.link3 && dog.link3 !== 'No image found') {
            imageUrl = dog.link3;
        }

        const card = document.createElement('div');
        card.className = 'dog-card';
        card.onclick = () => showDogDetails(dog);
        
        card.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${dog.breed}"
                 onerror="this.src='https://place-hold.it/300x200/gray/white&text=No%20Image'">
            <h3>${dog.breed}</h3>
        `;
        container.appendChild(card);
    });
}

function setupHeaderSearch() {
    const searchIcon = document.querySelector('.header-search-icon');
    const searchContainer = document.querySelector('.header-search-container');
    const searchInput = document.getElementById('headerSearchInput');
    const autocompleteResults = document.getElementById('autocompleteResults');

    // Toggle search on icon click
    searchIcon.addEventListener('click', () => {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
            searchInput.focus();
        }
    });

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search')) {
            searchContainer.classList.remove('active');
        }
    });

    // Handle input changes
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length < 1) {
            autocompleteResults.innerHTML = '';
            return;
        }

        const matches = window.allDogs.filter(dog => 
            dog.breed.toLowerCase().includes(searchTerm)
        ).slice(0, 5); // Limit to 5 results

        displayAutocompleteResults(matches, searchTerm);
    });
}

function displayAutocompleteResults(matches, searchTerm) {
    const autocompleteResults = document.getElementById('autocompleteResults');
    
    if (matches.length === 0) {
        autocompleteResults.innerHTML = `
            <div class="autocomplete-item">
                <span>No matches found</span>
            </div>
        `;
        return;
    }

    autocompleteResults.innerHTML = matches
        .map(dog => {
            const imageUrl = dog.link1 && dog.link1 !== 'No image found' ? 
                           dog.link1 : 'https://place-hold.it/40x40/gray/white&text=No%20Image';
            
            // Highlight the matched text
            const breedName = dog.breed.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<span class="highlight">${match}</span>`
            );

            return `
                <div class="autocomplete-item" onclick="showDogDetails(${JSON.stringify(dog).replace(/"/g, '&quot;')})">
                    <img src="${imageUrl}" alt="${dog.breed}" 
                         onerror="this.src='https://place-hold.it/40x40/gray/white&text=No%20Image'">
                    <span class="breed-name">${breedName}</span>
                </div>
            `;
        })
        .join('');
}

// Load dogs when the page loads
window.addEventListener('load', loadDogs);
