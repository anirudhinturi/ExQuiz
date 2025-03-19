document.getElementById('fileInput').addEventListener('change', handleFile);

let questions = [];
let currentQuizFile = null;
let currentQuestionIndex = 0;

function handleFile(event) {
    const file = event.target.files[0];
    currentQuizFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        questions = XLSX.utils.sheet_to_json(worksheet);
        displayQuestions();
        showQuestion(currentQuestionIndex);
    };
    reader.readAsArrayBuffer(file);
}

function displayQuestions() {
    const quizContainer = document.getElementById('quizQuestions');
    quizContainer.innerHTML = '';
    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.id = `question${index}`;
        questionElement.innerHTML = `
            <p>${question.Question}</p>
            <label><input type="radio" name="question${index}" value="${question.Option1}"> ${question.Option1}</label><br>
            <label><input type="radio" name="question${index}" value="${question.Option2}"> ${question.Option2}</label><br>
            <label><input type="radio" name="question${index}" value="${question.Option3}"> ${question.Option3}</label><br>
            <label><input type="radio" name="question${index}" value="${question.Option4}"> ${question.Option4}</label><br>
        `;
        quizContainer.appendChild(questionElement);
    });

    document.getElementById('navigationButtons').style.display = 'block';
    document.getElementById('nextBtn').style.display = 'inline-block';
    document.getElementById('submitBtn').style.display = 'none';
}

function showQuestion(index) {
    document.querySelectorAll('.question').forEach((el, i) => {
        el.style.display = i === index ? 'block' : 'none';
    });
    document.getElementById('prevBtn').style.display = index > 0 ? 'inline-block' : 'none';
    document.getElementById('nextBtn').style.display = index < questions.length - 1 ? 'inline-block' : 'none';
    document.getElementById('submitBtn').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
}

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
});

document.getElementById('submitBtn').addEventListener('click', () => {
    const resultsContainer = document.getElementById('results');
    let score = 0;
    resultsContainer.innerHTML = '';

    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
        const resultElement = document.createElement('div');
        resultElement.classList.add('result');
        
        if (selectedOption) {
            if (selectedOption.value === question.Answer.toString()) {
                score++;
                resultElement.classList.add('correct');
                resultElement.innerHTML = `<p>${question.Question} - Your answer: ${selectedOption.value} (Correct)</p>`;
            } else {
                resultElement.classList.add('incorrect');
                resultElement.innerHTML = `<p>${question.Question} - Your answer: ${selectedOption.value} (Correct: ${question.Answer})</p>`;
            }
        } else {
            resultElement.classList.add('incorrect');
            resultElement.innerHTML = `<p>${question.Question} - No answer selected (Correct: ${question.Answer})</p>`;
        }

        resultsContainer.appendChild(resultElement);
    });

    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';
    resultsContainer.innerHTML += `<p>Your score is ${score} out of ${questions.length}</p>`;
});

document.getElementById('retakeBtn').addEventListener('click', () => {
    currentQuestionIndex = 0;
    displayQuestions();
    showQuestion(currentQuestionIndex);
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
});
