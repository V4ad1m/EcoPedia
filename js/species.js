document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const speciesContainer = document.getElementById('speciesContainer');
    const speciesModal = document.getElementById('speciesModal');
    const closeModal = document.querySelector('.close-modal');
    const searchInput = document.getElementById('speciesSearch');
    const searchBtn = document.getElementById('searchBtn');
    const regionFilter = document.getElementById('regionFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    // Параметры пагинации
    let currentPage = 1;
    const itemsPerPage = 9;
    let totalPages = 1;
    let allSpecies = [];
    let filteredSpecies = [];
    
    // Загрузка данных
    async function loadSpeciesData() {
        try {
            // Для примера используем мок данные
            allSpecies = await fetchSpeciesData();
            filteredSpecies = [...allSpecies];
            totalPages = Math.ceil(filteredSpecies.length / itemsPerPage);
            renderSpecies();
            updatePagination();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            speciesContainer.innerHTML = '<p class="error">Не удалось загрузить данные. Пожалуйста, попробуйте позже.</p>';
        }
    }
    
    // Рендер списка видов
    function renderSpecies() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const speciesToShow = filteredSpecies.slice(startIndex, endIndex);
        
        if (speciesToShow.length === 0) {
            speciesContainer.innerHTML = '<p class="no-results">По вашему запросу ничего не найдено.</p>';
            return;
        }
        
        speciesContainer.innerHTML = '';
        
        speciesToShow.forEach(species => {
            const card = document.createElement('div');
            card.className = 'species-card';
            card.innerHTML = `
                <img src="${species.images[0]}" alt="${species.name}">
                <div class="species-card-content">
                    <h3>${species.name}</h3>
                    <span class="species-status">${getStatusLabel(species.status)}</span>
                    <p>${species.shortDescription}</p>
                    <a href="#" class="read-more" data-id="${species.id}">Подробнее</a>
                </div>
            `;
            
            speciesContainer.appendChild(card);
        });
        
        // Добавляем обработчики для кнопок "Подробнее"
        document.querySelectorAll('.read-more').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const speciesId = this.getAttribute('data-id');
                showSpeciesDetails(speciesId);
            });
        });
    }
    
    // Показать детали вида
    function showSpeciesDetails(speciesId) {
        const species = allSpecies.find(s => s.id === speciesId);
        if (!species) return;
        
        // Заполняем модальное окно данными
        document.getElementById('modalSpeciesName').textContent = species.name;
        document.getElementById('modalSpeciesStatus').textContent = getStatusLabel(species.status);
        document.getElementById('modalSpeciesDesc').textContent = species.description;
        document.getElementById('modalSpeciesRange').textContent = species.range;
        document.getElementById('modalSpeciesImage').src = species.images[0];
        document.getElementById('modalSpeciesImage').alt = species.range;
        
        // Устанавливаем изображение ареала обитания
        const rangeImageElement = document.getElementById('rangeImage');
        if (species.rangeImage) {
            rangeImageElement.src = species.rangeImage;
            rangeImageElement.style.display = 'block';
        } else {
            rangeImageElement.style.display = 'none';
        }
        
        // Очищаем и заполняем миниатюры
        const thumbnailsContainer = document.getElementById('speciesThumbnails');
        thumbnailsContainer.innerHTML = '';
        species.images.forEach((img, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = img;
            thumbnail.alt = `${species.name} ${index + 1}`;
            if (index === 0) thumbnail.classList.add('active');
            thumbnail.addEventListener('click', () => {
                document.getElementById('modalSpeciesImage').src = img;
                document.querySelectorAll('#speciesThumbnails img').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            thumbnailsContainer.appendChild(thumbnail);
        });
        
        // Очищаем и заполняем угрозы
        const threatsList = document.getElementById('modalSpeciesThreats');
        threatsList.innerHTML = '';
        species.threats.forEach(threat => {
            const li = document.createElement('li');
            li.textContent = threat;
            threatsList.appendChild(li);
        });
        
        // Очищаем и заполняем меры охраны
        const conservationList = document.getElementById('modalSpeciesConservation');
        conservationList.innerHTML = '';
        species.conservationMeasures.forEach(measure => {
            const li = document.createElement('li');
            li.textContent = measure;
            conservationList.appendChild(li);
        });
        
        // Показываем модальное окно
        speciesModal.style.display = 'block';
    }
    
    // Фильтрация видов
    function filterSpecies() {
        const searchTerm = searchInput.value.toLowerCase();
        const region = regionFilter.value;
        const category = categoryFilter.value;
        const status = statusFilter.value;
        
        filteredSpecies = allSpecies.filter(species => {
            // Поиск по названию и описанию
            const matchesSearch = species.name.toLowerCase().includes(searchTerm) || 
                                species.description.toLowerCase().includes(searchTerm);
            
            // Фильтр по региону
            const matchesRegion = !region || species.region === region;
            
            // Фильтр по категории
            const matchesCategory = !category || species.category === category;
            
            // Фильтр по статусу
            const matchesStatus = !status || species.status === status;
            
            return matchesSearch && matchesRegion && matchesCategory && matchesStatus;
        });
        
        currentPage = 1;
        totalPages = Math.ceil(filteredSpecies.length / itemsPerPage);
        renderSpecies();
        updatePagination();
    }
    
    // Обновление пагинации
    function updatePagination() {
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    // Получить текстовое обозначение статуса
    function getStatusLabel(statusCode) {
        const statusMap = {
            'CR': 'На грани исчезновения',
            'EN': 'Вымирающие',
            'VU': 'Уязвимые',
            'NT': 'Близки к уязвимому положению',
            'LC': 'Вызывающие наименьшие опасения'
        };
        return statusMap[statusCode] || statusCode;
    }
    
    // Обработчики событий
    searchBtn.addEventListener('click', filterSpecies);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') filterSpecies();
    });
    
    regionFilter.addEventListener('change', filterSpecies);
    categoryFilter.addEventListener('change', filterSpecies);
    statusFilter.addEventListener('change', filterSpecies);
    
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderSpecies();
            updatePagination();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderSpecies();
            updatePagination();
        }
    });
    
    closeModal.addEventListener('click', function() {
        speciesModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === speciesModal) {
            speciesModal.style.display = 'none';
        }
    });
    
    // Загружаем данные при загрузке страницы
    loadSpeciesData();
});
