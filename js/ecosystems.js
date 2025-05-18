document.addEventListener("DOMContentLoaded", function () {
  // Элементы DOM
  const ecosystemsContainer = document.getElementById("ecosystemsContainer");
  const ecosystemModal = document.getElementById("ecosystemModal");
  const closeModal = document.querySelector(".close-modal");
  const searchInput = document.getElementById("ecosystemsSearch");
  const searchBtn = document.getElementById("searchBtn");
  const climateFilter = document.getElementById("climateFilter");
  const typeFilter = document.getElementById("typeFilter");
  const threatFilter = document.getElementById("threatFilter");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  // Параметры пагинации
  let currentPage = 1;
  const itemsPerPage = 9;
  let totalPages = 1;
  let allEcosystems = [];
  let filteredEcosystems = [];

  // Загрузка данных
  async function loadEcosystemsData() {
    try {
      allEcosystems = await fetchEcosystemsData();
      filteredEcosystems = [...allEcosystems];
      totalPages = Math.ceil(filteredEcosystems.length / itemsPerPage);
      renderEcosystems();
      updatePagination();

      // Заполняем фильтр климатов
      const climates = [...new Set(allEcosystems.flatMap((e) => e.climates))];
      climateFilter.innerHTML = '<option value="">Все климаты</option>';
      climates.forEach((climate) => {
        const option = document.createElement("option");
        option.value = climate;
        option.textContent = climate;
        climateFilter.appendChild(option);
      });
      
      // Заполняем фильтр типов
      const types = [...new Set(allEcosystems.flatMap((e) => e.type))];
      typeFilter.innerHTML = '<option value="">Все типы</option>';
      types.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
      });

      // Заполняем фильтр угроз
      const threats = [...new Set(allEcosystems.flatMap((e) => e.threats))];
      threatFilter.innerHTML = '<option value="">Все угрозы</option>';
      threats.forEach((threat) => {
        const option = document.createElement("option");
        option.value = threat;
        option.textContent = threat;
        threatFilter.appendChild(option);
      });
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      ecosystemsContainer.innerHTML =
        '<p class="error">Не удалось загрузить данные. Пожалуйста, попробуйте позже.</p>';
    }
  }

  // Рендер списка экосистем
  function renderEcosystems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const ecosystemsToShow = filteredEcosystems.slice(startIndex, endIndex);

    if (ecosystemsToShow.length === 0) {
      ecosystemsContainer.innerHTML =
        '<p class="no-results">По вашему запросу ничего не найдено.</p>';
      return;
    }

    ecosystemsContainer.innerHTML = "";

    ecosystemsToShow.forEach((ecosystem) => {
      const card = document.createElement("div");
      card.className = "ecosystem-card";
      card.innerHTML = `
                <img src="${ecosystem.images[0]}" alt="${ecosystem.name}">
                <div class="ecosystem-card-content">
                    <h3>${ecosystem.name}</h3>
                    <div class="ecosystem-meta">
                        <span class="ecosystem-climate">${ecosystem.climates.join(
                          ", "
                        )}</span>
                    </div>
                    <p>${ecosystem.shortDescription}</p>
                    <a href="#" class="read-more" data-id="${
                      ecosystem.id
                    }">Подробнее</a>
                </div>
            `;

      ecosystemsContainer.appendChild(card);
    });

    // Добавляем обработчики для кнопок "Подробнее"
    document.querySelectorAll(".read-more").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const ecosystemId = this.getAttribute("data-id");
        showEcosystemDetails(ecosystemId);
      });
    });
  }

  // Показать детали экосистемы
  function showEcosystemDetails(ecosystemId) {
    const ecosystem = allEcosystems.find((e) => e.id === ecosystemId);
    if (!ecosystem) return;

    // Заполняем модальное окно данными
    document.getElementById("modalEcosystemName").textContent = ecosystem.name;
    document.getElementById("modalEcosystemDesc").textContent =
      ecosystem.description;
    document.getElementById("modalEcosystemLocation").textContent =
      ecosystem.location;
    document.getElementById("modalEcosystemClimate").textContent =
      ecosystem.climateDetails;
    document.getElementById("modalEcosystemImage").src = ecosystem.images[0];
    document.getElementById("modalEcosystemImage").alt = ecosystem.name;

    // Устанавливаем изображение карты
    const locationImageElement = document.getElementById("locationImage");
    if (ecosystem.locationImage) {
      locationImageElement.src = ecosystem.locationImage;
      locationImageElement.style.display = "block";
    } else {
      locationImageElement.style.display = "none";
    }

    // Очищаем и заполняем миниатюры
    const thumbnailsContainer = document.getElementById("ecosystemThumbnails");
    thumbnailsContainer.innerHTML = "";
    ecosystem.images.forEach((img, index) => {
      const thumbnail = document.createElement("img");
      thumbnail.src = img;
      thumbnail.alt = `${ecosystem.name} ${index + 1}`;
      if (index === 0) thumbnail.classList.add("active");
      thumbnail.addEventListener("click", () => {
        document.getElementById("modalEcosystemImage").src = img;
        document
          .querySelectorAll("#ecosystemThumbnails img")
          .forEach((t) => t.classList.remove("active"));
        thumbnail.classList.add("active");
      });
      thumbnailsContainer.appendChild(thumbnail);
    });

    // Очищаем и заполняем биоразнообразие
    const biodiversityList = document.getElementById(
      "modalEcosystemBiodiversity"
    );
    biodiversityList.innerHTML = "";
    ecosystem.biodiversity.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      biodiversityList.appendChild(li);
    });

    // Очищаем и заполняем угрозы
    const threatsList = document.getElementById("modalEcosystemThreats");
    threatsList.innerHTML = "";
    ecosystem.threats.forEach((threat) => {
      const li = document.createElement("li");
      li.textContent = threat;
      threatsList.appendChild(li);
    });

    // Очищаем и заполняем меры охраны
    const conservationList = document.getElementById(
      "modalEcosystemConservation"
    );
    conservationList.innerHTML = "";
    ecosystem.conservationMeasures.forEach((measure) => {
      const li = document.createElement("li");
      li.textContent = measure;
      conservationList.appendChild(li);
    });

    // Показываем модальное окно
    ecosystemModal.style.display = "block";
  }

  // Фильтрация экосистем
  function filterEcosystems() {
    const searchTerm = searchInput.value.toLowerCase();
    const climate = climateFilter.value;
    const type = typeFilter.value;
    const threat = threatFilter.value;

    filteredEcosystems = allEcosystems.filter((ecosystem) => {
      // Поиск по названию и описанию
      const matchesSearch =
        ecosystem.name.toLowerCase().includes(searchTerm) ||
        ecosystem.description.toLowerCase().includes(searchTerm);

      // Фильтр по климату
      const matchesClimate = !climate || ecosystem.climates.includes(climate);

      // Фильтр по типу
      const matchesType = !type || ecosystem.type === type;

      // Фильтр по угрозам
      const matchesThreat = !threat || ecosystem.threats.includes(threat);

      return matchesSearch && matchesClimate && matchesType && matchesThreat;
    });

    currentPage = 1;
    totalPages = Math.ceil(filteredEcosystems.length / itemsPerPage);
    renderEcosystems();
    updatePagination();
  }

  // Обновление пагинации
  function updatePagination() {
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // Обработчики событий
  searchBtn.addEventListener("click", filterEcosystems);
  searchInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") filterEcosystems();
  });

  climateFilter.addEventListener("change", filterEcosystems);
  typeFilter.addEventListener("change", filterEcosystems);
  threatFilter.addEventListener("change", filterEcosystems);

  prevPageBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderEcosystems();
      updatePagination();
    }
  });

  nextPageBtn.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      renderEcosystems();
      updatePagination();
    }
  });

  closeModal.addEventListener("click", function () {
    ecosystemModal.style.display = "none";
  });

  window.addEventListener("click", function (e) {
    if (e.target === ecosystemModal) {
      ecosystemModal.style.display = "none";
    }
  });

  // Загружаем данные при загрузке страницы
  loadEcosystemsData();
});
