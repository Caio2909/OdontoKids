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

    // --- DADOS DO AVATAR (CORRIGIDOS CONFORME A DOCUMENTAÇÃO) ---
    const avatarPartsData = {

    top: ['shortFlat', 'shortWaved', 'curvy', 'fro', 'straightAndStrand', 'bob', 'curly'],
    hairColor: ['a55728', '2c1b18', 'b58143', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'],
    accessories: [ 'prescription01', 'prescription02', 'round', 'sunglasses', 'none'],
    clothing: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck'],
    eyebrows: ['default', 'defaultNatural', 'flatNatural', 'raisedExcited', 'sadConcerned'],
    mouth: ['default', 'concerned', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'twinkle'],
    skinColor: ['614335', 'd08b5b', 'ae5d29', 'edb98a', 'ffdbb4', 'fd9841', 'f8d25c'] // Also updated with valid hex codes
};


    let currentAvatar = {
        top: 'shortFlat',
        accessories: 'prescription01',
        hairColor: 'a55728',
        clothing: 'hoodie',
        eyes: 'default',
        eyebrows: 'default',
        mouth: 'smile',
        skinColor: 'edb98a'
    };
     const translations = {
         categories: {
             top: 'Cabelo',
             hairColor: 'Cor do Cabelo',
             accessories: 'Acessórios',
             clothing: 'Roupa',
             eyebrows: 'Sobrancelhas',
             mouth: 'Boca',
             skinColor: 'Cor de Pele'
         },
         top: {
             shortFlat: 'Curto Liso',
             shortWaved: 'Curto Ondulado',
             curvy: 'Encaracolado',
             fro: 'Afro',
             straightAndStrand: 'Liso com Franja',
             bob: 'Chanel',
             curly: 'Cacheado',
         },
         accessories: {
             prescription01: 'Óculos de Grau 1',
             prescription02: 'Óculos de Grau 2',
             round: 'Óculos Redondo',
             sunglasses: 'Óculos de Sol',
             none: 'Nenhum'
         },
         clothing: {
             blazerAndShirt: 'Blazer e Camisa',
             blazerAndSweater: 'Blazer e Suéter',
             collarAndSweater: 'Gola e Suéter',
             graphicShirt: 'Camiseta Estampada',
             hoodie: 'Moletom',
             overall: 'Macacão',
             shirtCrewNeck: 'Camiseta Gola Careca'
         },
         eyebrows: {
             default: 'Padrão',
             defaultNatural: 'Natural',
             flatNatural: 'Reta',
             raisedExcited: 'Animada',
             sadConcerned: 'Preocupada',
         },
         mouth: {
             default: 'Padrão',
             concerned: 'Preocupada',
             disbelief: 'Incrédula',
             eating: 'Comendo',
             grimace: 'Careta',
             sad: 'Triste',
             screamOpen: 'Gritando',
             serious: 'Séria',
             smile: 'Sorrindo',
             twinkle: 'Radiante'
         }
     };

    const avatarPreview = document.getElementById('avatar-preview');

    function renderAvatar(container, avatarConfig, expression = 'normal') {
    const baseUrl = 'https://api.dicebear.com/9.x/avataaars/svg?';
    let options = { ...avatarConfig }; // Remove accessoriesProbability: 100
    if (avatarConfig.accessories === 'none' || avatarConfig.accessories === 'blank') {
        options.accessoriesProbability = 0;
        delete options.accessories; // Remove a opção accessories
    } else {
        options.accessoriesProbability = 100; // Força exibição do acessório selecionado
    }
    switch(expression) {
        case 'happy':
            options.mouth = 'smile';
            options.eyes = 'happy';
            break;
        case 'sad':
            options.mouth = 'sad';
            options.eyes = 'cry';
            break;
        case 'normal':
            options.mouth = 'default'
            options.eyes = 'default'
    }

    const params = new URLSearchParams(options);
    const avatarUrl = `${baseUrl}${params.toString()}`;

    container.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-full h-full">`;
}

    function setupAvatarOptions() {
        const createOptionButton = (type, value) => {
            const button = document.createElement('button');
            button.className = 'option-button bg-sky-200 text-sky-800 text-sm p-2 rounded-lg';

            // Define o texto ou a cor do botão
            if (type === 'hairColor' || type === 'skinColor') {
                button.style.backgroundColor = `#${value}`;
                button.style.width = '30px';
                button.style.height = '30px';
                button.title = value; // Mostra o código da cor ao passar o mouse
            } else {
                // Busca a tradução. Se não encontrar, usa o valor original.
                button.textContent = translations[type]?.[value] || value;
            }

            button.dataset.value = value;

            button.onclick = () => {
                currentAvatar[type] = value;
                renderAvatar(avatarPreview, currentAvatar);
                updateSelectedButton(type);
            };
            return button;
        };

        const updateSelectedButton = (type) => {
            const container = document.getElementById(`${type}-options`);
            Array.from(container.children).forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.value === currentAvatar[type]);
            });
        };

        Object.keys(avatarPartsData).forEach(type => {
            const container = document.getElementById(`${type}-options`);
            if (container) {
                container.innerHTML = '';
                // Define o título da categoria usando o objeto de traduções
                container.parentElement.querySelector('h3').textContent = translations.categories[type] || type;

                avatarPartsData[type].forEach(value => {
                    container.appendChild(createOptionButton(type, value));
                });
                updateSelectedButton(type);
            }
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
                await checkLoginStatus();
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
        checkLoginStatus();
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