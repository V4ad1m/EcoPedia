document.addEventListener("DOMContentLoaded", async function () {
  // База вопросов
  const allQuizQuestions = await fetchQuizQuestions();

  // Настройки викторины
  const QUIZ_LENGTH = 10; 

  // Элементы DOM
  const quizContent = document.getElementById("quizContent");
  const quizProgress = document.getElementById("quizProgress");
  let currentQuestion = 0;
  let score = 0;
  let selectedOption = null;
  let quizData = [];

  // Инициализация викторины
  function initQuiz() {
    // Выбираем случайные вопросы
    quizData = getRandomQuestions(allQuizQuestions, QUIZ_LENGTH);
    currentQuestion = 0;
    score = 0;
    showQuestion();
  }

  // Функция для выбора случайных вопросов
  function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Показать вопрос
  function showQuestion() {
  if (currentQuestion >= quizData.length) {
    showResult();
    return;
  }

  const question = quizData[currentQuestion];
  selectedOption = null;

  // Обновление прогресса 
  quizProgress.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;

  // Остальной код функции без изменений
  let html = `
    <div class="quiz-question">
      <h2>Вопрос ${currentQuestion + 1}: ${question.question}</h2>
      <div class="quiz-options">
  `;

    // Перемешиваем варианты ответов
    const shuffledOptions = shuffleArray([...question.options]);
    const correctAnswerIndex = shuffledOptions.indexOf(
      question.options[question.answer]
    );

    shuffledOptions.forEach((option, index) => {
      html += `
                        <div class="quiz-option" data-index="${index}" data-correct="${
        index === correctAnswerIndex
      }">
                            ${option}
                        </div>
                    `;
    });

    html += `
                        </div>
                        <div class="quiz-navigation">
                            <button class="quiz-btn" id="prevBtn" ${
                              currentQuestion === 0 ? "disabled" : ""
                            }>Назад</button>
                            <button class="quiz-btn" id="nextBtn" disabled>${
                              currentQuestion === quizData.length - 1
                                ? "Завершить"
                                : "Далее"
                            }</button>
                        </div>
                    </div>
                `;

    quizContent.innerHTML = html;

    // Добавление обработчиков событий
    document.querySelectorAll(".quiz-option").forEach((option) => {
      option.addEventListener("click", selectOption);
    });

    document.getElementById("prevBtn").addEventListener("click", prevQuestion);
    document.getElementById("nextBtn").addEventListener("click", nextQuestion);
  }

  // Функция для перемешивания массива
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Выбор варианта ответа
  function selectOption(e) {
    const selectedElement = e.currentTarget;
    const optionIndex = parseInt(selectedElement.getAttribute("data-index"));
    const isCorrect = selectedElement.getAttribute("data-correct") === "true";

    // Сброс предыдущего выбора
    document.querySelectorAll(".quiz-option").forEach((option) => {
      option.classList.remove("selected");
    });

    // Установка нового выбора
    selectedElement.classList.add("selected");
    selectedOption = {
      index: optionIndex,
      isCorrect: isCorrect,
    };
    document.getElementById("nextBtn").disabled = false;
  }

  // Предыдущий вопрос
  function prevQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion();
    }
  }

  // Следующий вопрос
  function nextQuestion() {
    if (selectedOption !== null) {
      // Подсвечиваем правильный/неправильный ответ
      document.querySelectorAll(".quiz-option").forEach((option) => {
        if (option.getAttribute("data-correct") === "true") {
          option.classList.add("correct");
        } else if (option.classList.contains("selected")) {
          option.classList.add("incorrect");
        }
      });

      setTimeout(() => {
        // Проверка ответа
        if (selectedOption.isCorrect) {
          score++;
        }

        currentQuestion++;
        showQuestion();
      }, 1000);
    }
  }

  // Показать результаты
  function showResult() {
    const percentage = Math.round((score / quizData.length) * 100);

    let message = "";
    if (percentage >= 80) {
      message = "Отличный результат!";
    } else if (percentage >= 60) {
      message = "Хороший результат!";
    } else if (percentage >= 40) {
      message = "Неплохо!";
    } else {
      message = "Попробуйте еще раз и узнайте больше о природе!";
    }

    quizContent.innerHTML = `
                    <div class="quiz-result">
                        <h2>Викторина завершена!</h2>
                        <div class="quiz-score">Ваш результат: ${score} из ${quizData.length} (${percentage}%)</div>
                        <p>${message}</p>
                        <button class="quiz-btn quiz-restart" id="restartBtn">Пройти еще раз</button>
                    </div>
                `;

    document.getElementById("restartBtn").addEventListener("click", initQuiz);
  }

  // Запуск викторины
  initQuiz();
});
