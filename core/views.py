from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from .models import User, Avatar, Assessment


def index(request):
    """Renderiza a página principal (SPA)."""
    return render(request, 'core/index.html')


@csrf_exempt  # Use com cuidado, idealmente configure o CSRF no front-end
def register_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('email')
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role')

        # Validação do lado do servidor
        if not all([username, email, password, name, role]):
            return JsonResponse({'status': 'error', 'message': 'Todos os campos são obrigatórios.'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'status': 'error', 'message': 'Este email já está em uso.'}, status=400)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.first_name = name
            user.role = role
            user.save()
            return JsonResponse({'status': 'success', 'message': 'Usuário criado com sucesso!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método inválido.'}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('email')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'status': 'success', 'message': 'Login bem-sucedido.'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Email ou senha inválidos.'}, status=401)

    return JsonResponse({'status': 'error', 'message': 'Método inválido.'}, status=405)


@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logout bem-sucedido.'})


@login_required
def get_user_data_view(request):
    """Fornece os dados do usuário logado para o front-end."""
    user = request.user
    avatar_config = None
    if hasattr(user, 'avatar'):
        avatar_config = user.avatar.get_config()

    assessments_data = list(
        Assessment.objects.filter(user=user).values('score', 'created_at')
    )
    # Convertendo datetime para string
    for assessment in assessments_data:
        assessment['createdAt'] = assessment.pop('created_at').strftime('%d/%m/%Y')

    data = {
        'name': user.first_name or user.username,
        'role': user.role,
        'avatar': avatar_config,
        'assessments': assessments_data,
    }
    return JsonResponse(data)


@csrf_exempt
@login_required
def handle_avatar_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        avatar_config = data.get('avatar')

        if not avatar_config:
            return JsonResponse({'status': 'error', 'message': 'Dados do avatar ausentes.'}, status=400)

        # Cria ou atualiza o avatar
        Avatar.objects.update_or_create(
            user=request.user,
            defaults={'config_json': json.dumps(avatar_config)}
        )
        return JsonResponse({'status': 'success', 'message': 'Avatar salvo com sucesso.'})

    return JsonResponse({'status': 'error', 'message': 'Método inválido.'}, status=405)


@csrf_exempt
@login_required
def save_assessment_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        Assessment.objects.create(
            user=request.user,
            score=data.get('score'),
            total_questions=data.get('totalQuestions')
        )
        return JsonResponse({'status': 'success', 'message': 'Avaliação salva com sucesso.'})

    return JsonResponse({'status': 'error', 'message': 'Método inválido.'}, status=405)
