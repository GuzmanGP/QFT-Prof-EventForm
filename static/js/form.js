[Previous JavaScript content up to updateQuestionList function...]

function updateQuestionList() {
    const list = document.getElementById('questionNavList');
    const listContainer = document.getElementById('questionsList');
    if (!list || !listContainer) return;
    
    const questions = document.querySelectorAll('.question-card');
    
    // Show/hide the list based on question count
    listContainer.classList.toggle('d-none', questions.length === 0);
    
    list.innerHTML = '';
    questions.forEach((card, index) => {
        const title = card.querySelector('.question-title').value || 'Untitled Question';
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.textContent = `Question ${index + 1}: ${title}`;
        item.addEventListener('click', () => {
            const questionCard = card.querySelector('.card-header');
            if (questionCard) {
                questionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        list.appendChild(item);
    });
}

[Rest of the JavaScript content remains the same...]
