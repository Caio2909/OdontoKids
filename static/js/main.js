document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA PARA OBTER O TOKEN CSRF DO DJANGO ---
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');


    // --- ELEMENTOS DO DOM ---
    const pages = {
        auth: document.getElementById('auth-page'),
        avatar: document.getElementById('avatar-creator-page'),
        dashboard: document.getElementById('child-dashboard-page'),
        assessment: document.getElementById('assessment-page'),
        results: document.getElementById('results-page'),
    };
    const loadingSpinner = document.getElementById('loading-spinner');
    const authError = document.getElementById('auth-error');

    // --- NAVEGAÇÃO ---
    const showPage = (pageId) => {
        Object.values(pages).forEach(page => page.classList.add('hidden'));
        if (pages[pageId]) {
            pages[pageId].classList.remove('hidden');
        }
    };

    const showLoading = (isLoading) => {
        loadingSpinner.classList.toggle('hidden', !isLoading);
    }

    // --- DADOS DO AVATAR ---
    const avatarPartsData = {
        skin: [
            { id: 'skin1', color: '#F2D5B7' },
            { id: 'skin2', color: '#D8B08C' },
            { id: 'skin3', color: '#A0765E' },
            { id: 'skin4', color: '#6E4E3D' },
        ],
        hair: [
            { id: 'hair1', svg: `<path d="M50 20 Q50 0 100 20 L100 50 Q50 60 0 50 L0 20 Q50 0 50 20 Z" fill="#333"/>` },
            { id: 'hair2', svg: `<path d="M0 30 Q50 -10 100 30 L100 50 Q50 70 0 50 Z" fill="#A52A2A"/>` },
            { id: 'hair3', svg: `<path d="M0 25 C 20 10, 80 10, 100 25 L 100 50 Q 50 65 0 50 Z" fill="#FFFF00"/>` },
        ],
        eyes: [
            { id: 'eyes1', svg: `<circle cx="35" cy="60" r="5" fill="#000"/><circle cx="65" cy="60" r="5" fill="#000"/>` },
            { id: 'eyes2', svg: `<rect x="30" y="55" width="10" height="7" fill="#000"/><rect x="60" y="55" width="10" height="7" fill="#000"/>` },
            { id: 'eyes3', svg: `<path d="M30 60 Q35 55 40 60 M60 60 Q65 55 70 60" stroke="#000" fill="none" stroke-width="2"/>` },
        ],
        mouth: [
            { id: 'mouth1', svg: `<path d="M40 85 Q50 95 60 85" stroke="#000" fill="none" stroke-width="2"/>` }, // Smile
            { id: 'mouth2', svg: `<path d="M40 90 Q50 80 60 90" stroke="#000" fill="none" stroke-width="2"/>` }, // Frown
            { id: 'mouth3', svg: `<line x1="40" y1="88" x2="60" y2="88" stroke="#000" stroke-width="2"/>` }, // Neutral
        ],
        clothes: [
                { id: 'clothes1', svg: `<path d="M20 100 L80 100 L80 180 L20 180 Z" fill="#3B82F6"/>` }, // Blue shirt
                { id: 'clothes2', svg: `<path d="M20 100 L80 100 L80 180 L20 180 Z" fill="#EC4899"/>` }, // Pink shirt
                { id: 'clothes3', svg: `<path d="M20 100 L80 100 L80 180 L20 180 Z" fill="#22C55E"/>` }, // Green shirt
        ]
    };

    let currentAvatar = {
        skin: avatarPartsData.skin[0].id,
        hair: avatarPartsData.hair[0].id,
        eyes: avatarPartsData.eyes[0].id,
        mouth: avatarPartsData.mouth[0].id,
        clothes: avatarPartsData.clothes[0].id,
    };

    const avatarPreview = document.getElementById('avatar-preview');

    function renderAvatar(container, avatarConfig, expression = 'normal') {
        const skinData = avatarPartsData.skin.find(s => s.id === avatarConfig.skin);
        const hairData = avatarPartsData.hair.find(h => h.id === avatarConfig.hair);
        const eyesData = avatarPartsData.eyes.find(e => e.id === avatarConfig.eyes);
        let mouthData;

        switch(expression) {
            case 'happy':
                mouthData = avatarPartsData.mouth[0];
                break;
            case 'sad':
                mouthData = avatarPartsData.mouth[1];
                break;
            default:
                mouthData = avatarPartsData.mouth.find(m => m.id === avatarConfig.mouth);
        }

        const clothesData = avatarPartsData.clothes.find(c => c.id === avatarConfig.clothes);

        container.innerHTML = `
            <svg viewBox="0 0 100 150" class="w-full h-full">
                <!-- Corpo -->
                <path d="M20 100 L80 100 L80 180 L20 180 Z" fill="${skinData.color}"/>
                ${clothesData.svg}

                <!-- Cabeça -->
                <circle cx="50" cy="50" r="40" fill="${skinData.color}"/>
                
                <!-- Partes -->
                ${hairData.svg}
                ${eyesData.svg}
                ${mouthData.svg}
            </svg>
        `;
    }

    function setupAvatarOptions() {
        const createOptionButton = (item, type) => {
            const button = document.createElement('button');
            button.className = 'option-button border-2 border-gray-300 rounded-lg p-2';
            if (type === 'skin' || type === 'clothes') {
                button.style.backgroundColor = item.color || item.svg.match(/fill="([^"]+)"/)[1];
                button.style.width = '40px';
                button.style.height = '40px';
            } else {
                button.innerHTML = `<svg viewBox="0 0 100 100" class="w-10 h-10">${item.svg}</svg>`;
            }

            button.onclick = () => {
                currentAvatar[type] = item.id;
                renderAvatar(avatarPreview, currentAvatar);
                updateSelectedButton(type);
            };
            return button;
        };

        const updateSelectedButton = (type) => {
            const container = document.getElementById(`${type}-options`);
            Array.from(container.children).forEach((btn, index) => {
                btn.classList.toggle('selected', avatarPartsData[type][index].id === currentAvatar[type]);
            });
        };

        Object.keys(avatarPartsData).forEach(type => {
            const container = document.getElementById(`${type}-options`);
            container.innerHTML = '';
            avatarPartsData[type].forEach(item => {
                container.appendChild(createOptionButton(item, type));
            });
            updateSelectedButton(type);
        });
    }

    // --- DADOS DA AVALIAÇÃO ---
    const assessmentQuestions = [
        { text: "Como você se sente sobre ir ao dentista hoje?", options: [{ expression: 'happy', score: 0 }, { expression: 'sad', score: 1 }] },
        { text: "O que você acha da cadeira do dentista?", options: [{ expression: 'normal', score: 0 }, { expression: 'sad', score: 1 }] },
        { text: "Como os barulhinhos do consultório te fazem sentir?", options: [{ expression: 'happy', score: 0 }, { expression: 'sad', score: 1 }] },
        { text: "Você está animado para deixar seus dentes brilhando?", options: [{ expression: 'happy', score: 0 }, { expression: 'normal', score: 1 }] },
        { text: "Como você se sente quando o dentista olha seus dentes?", options: [{ expression: 'normal', score: 0 }, { expression: 'sad', score: 1 }] },
        { text: "Depois da consulta, como você acha que vai se sentir?", options: [{ expression: 'happy', score: 0 }, { expression: 'normal', score: 1 }] },
    ];
    let currentQuestionIndex = 0;
    let currentScore = 0;
    let userProfile = null;

    function startAssessment() {
        currentQuestionIndex = 0;
        currentScore = 0;
        document.getElementById('total-question-number').textContent = assessmentQuestions.length;
        loadQuestion();
        showPage('assessment');
    }

    function loadQuestion() {
        const question = assessmentQuestions[currentQuestionIndex];
        const container = document.getElementById('assessment-options-container');

        document.getElementById('assessment-question-title').textContent = question.text;
        document.getElementById('current-question-number').textContent = currentQuestionIndex + 1;

        const progress = ((currentQuestionIndex) / assessmentQuestions.length) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;

        container.innerHTML = '';
        question.options.forEach(option => {
            const card = document.createElement('div');
            card.className = 'assessment-card bg-sky-50 rounded-lg p-4 w-48 border-2 border-sky-200';

            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'w-32 h-48 mx-auto';
            renderAvatar(avatarContainer, userProfile.avatar, option.expression);

            card.appendChild(avatarContainer);
            card.onclick = () => selectAnswer(option.score);
            container.appendChild(card);
        });
    }

    async function selectAnswer(score) {
        currentScore += score;
        currentQuestionIndex++;

        if (currentQuestionIndex < assessmentQuestions.length) {
            loadQuestion();
        } else {
            document.getElementById('progress-bar').style.width = '100%';
            await saveAssessmentResult();
            showResults();
        }
    }

    async function saveAssessmentResult() {
        showLoading(true);
        try {
            await fetch('/api/assessment/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    score: currentScore,
                    totalQuestions: assessmentQuestions.length
                })
            });
        } catch (error) {
            console.error("Erro ao salvar avaliação: ", error);
        } finally {
            showLoading(false);
        }
    }

    function showResults() {
        document.getElementById('result-score').textContent = currentScore;
        let message = "";
        if (currentScore <= 1) {
            message = "Você parece estar super tranquilo e feliz! Continue com esse sorriso brilhante!";
        } else if (currentScore <= 3) {
            message = "É normal sentir um pouquinho de nervoso, mas você foi muito corajoso(a)!";
        } else {
            message = "Sabemos que pode ser um pouco assustador, mas você conseguiu! Estamos orgulhosos de você!";
        }
        document.getElementById('result-message').textContent = message;
        showPage('results');
    }

    // --- AUTENTICAÇÃO E DADOS DO USUÁRIO ---
    async function checkLoginStatus() {
        showLoading(true);
        try {
            const response = await fetch('/api/user-data/');
            if (response.ok) {
                userProfile = await response.json();
                loadDashboard();
            } else {
                showPage('auth');
            }
        } catch (error) {
            console.error("Não foi possível verificar o status do login:", error);
            showPage('auth');
        } finally {
            showLoading(false);
        }
    }

    function loadDashboard() {
        if (!userProfile) return;

        if (userProfile.role === 'crianca') {
            document.getElementById('child-name').textContent = userProfile.name;
            if (userProfile.avatar) {
                const dashboardAvatar = document.getElementById('dashboard-avatar-display');
                renderAvatar(dashboardAvatar, userProfile.avatar);
                loadAssessmentHistory();
                showPage('dashboard');
            } else {
                setupAvatarOptions();
                renderAvatar(avatarPreview, currentAvatar);
                showPage('avatar');
            }
        } else {
            // TODO: Implementar dashboard do dentista
            alert("Dashboard do dentista ainda não implementado.");
            showPage('auth');
        }
    }

    function loadAssessmentHistory() {
        const historyContainer = document.getElementById('assessment-history');
        if (!userProfile || !userProfile.assessments || userProfile.assessments.length === 0) {
            historyContainer.innerHTML = '<p>Nenhuma avaliação encontrada.</p>';
            return;
        }

        let historyHtml = '';
        userProfile.assessments.forEach(data => {
            historyHtml += `<div class="bg-white p-2 rounded mb-2 border">Data: ${data.createdAt} - Pontuação: ${data.score}</div>`;
        });
        historyContainer.innerHTML = historyHtml;
    }

    // --- EVENT LISTENERS ---
    document.getElementById('show-register-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        authError.textContent = '';
    });
    document.getElementById('show-login-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        authError.textContent = '';
    });

    document.getElementById('register-button').addEventListener('click', async () => {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        authError.textContent = '';

        // Validação de dados com JavaScript
        if (!name || !email || !password) {
            authError.textContent = 'Por favor, preencha todos os campos.';
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            authError.textContent = 'Por favor, insira um email válido.';
            return;
        }

        showLoading(true);
        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Cadastro realizado com sucesso! Faça o login.');
                document.getElementById('show-login-link').click();
            } else {
                authError.textContent = data.message || 'Erro no cadastro.';
            }
        } catch (error) {
            authError.textContent = 'Erro de conexão. Tente novamente.';
        } finally {
            showLoading(false);
        }
    });

    document.getElementById('login-button').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        authError.textContent = '';
        if (!email || !password) {
            authError.textContent = 'Por favor, preencha email e senha.';
            return;
        }

        showLoading(true);
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                await checkLoginStatus(); // Carrega os dados do usuário após o login
            } else {
                authError.textContent = data.message || 'Erro no login.';
            }
        } catch (error) {
            authError.textContent = 'Erro de conexão. Tente novamente.';
        } finally {
            showLoading(false);
        }
    });

    document.getElementById('logout-button').addEventListener('click', async () => {
        await fetch('/api/logout/', { method: 'POST', headers: { 'X-CSRFToken': csrftoken } });
        userProfile = null;
        showPage('auth');
    });

    document.getElementById('save-avatar-button').addEventListener('click', async () => {
        showLoading(true);
        try {
            const response = await fetch('/api/avatar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ avatar: currentAvatar })
            });
            if (response.ok) {
                userProfile.avatar = currentAvatar;
                loadDashboard();
            } else {
                alert("Não foi possível salvar seu avatar. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao salvar avatar: ", error);
            alert("Erro de conexão ao salvar o avatar.");
        } finally {
            showLoading(false);
        }
    });

    document.getElementById('start-assessment-button').addEventListener('click', startAssessment);
    document.getElementById('back-to-dashboard-button').addEventListener('click', () => {
        checkLoginStatus(); // Recarrega os dados para mostrar o histórico atualizado
    });
    document.getElementById('edit-avatar-button').addEventListener('click', () => {
        currentAvatar = userProfile.avatar;
        setupAvatarOptions();
        renderAvatar(avatarPreview, currentAvatar);
        showPage('avatar');
    });

    // --- INICIALIZAÇÃO ---
    checkLoginStatus();

});
