// loadHistory.js
export async function fetchFormLoadHistory(formId, page = 1, perPage = 10) {
    try {
        const response = await fetch(`/api/form/${formId}/load-history?page=${page}&per_page=${perPage}`);
        if (!response.ok) {
            throw new Error('Failed to fetch load history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching form load history:', error);
        throw error;
    }
}

export function displayLoadHistory(containerId, historyData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const historyHtml = `
        <div class="card mt-4">
            <div class="card-header">
                <h5 class="mb-0">Form Load History</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Loaded At</th>
                                <th>IP Address</th>
                                <th>User Agent</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historyData.history.map(h => `
                                <tr class="animate__animated animate__fadeIn">
                                    <td>${new Date(h.loaded_at).toLocaleString()}</td>
                                    <td>${h.ip_address}</td>
                                    <td>${h.user_agent}</td>
                                    <td>
                                        <span class="badge ${h.success ? 'bg-success' : 'bg-danger'}">
                                            ${h.success ? 'Success' : 'Failed'}
                                        </span>
                                        ${!h.success && h.error_message ? 
                                            `<div class="small text-danger">${h.error_message}</div>` : 
                                            ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(historyData)}
            </div>
        </div>
    `;
    
    container.innerHTML = historyHtml;
    setupPaginationHandlers(containerId, historyData);
}

function renderPagination(historyData) {
    const { current_page, pages, total } = historyData;
    
    if (pages <= 1) return '';
    
    let paginationHtml = `
        <nav aria-label="Load history pagination" class="mt-3">
            <ul class="pagination justify-content-center">
                <li class="page-item ${current_page === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${current_page - 1}">Previous</a>
                </li>
    `;
    
    for (let i = 1; i <= pages; i++) {
        paginationHtml += `
            <li class="page-item ${i === current_page ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    paginationHtml += `
                <li class="page-item ${current_page === pages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${current_page + 1}">Next</a>
                </li>
            </ul>
        </nav>
    `;
    
    return paginationHtml;
}

function setupPaginationHandlers(containerId, historyData) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const pagination = container.querySelector('.pagination');
    if (!pagination) return;
    
    pagination.addEventListener('click', async (e) => {
        e.preventDefault();
        const pageLink = e.target.closest('.page-link');
        if (!pageLink) return;
        
        const page = parseInt(pageLink.dataset.page);
        if (isNaN(page) || page < 1 || page > historyData.pages) return;
        
        try {
            const newHistoryData = await fetchFormLoadHistory(formId, page);
            displayLoadHistory(containerId, newHistoryData);
        } catch (error) {
            console.error('Error changing page:', error);
        }
    });
}