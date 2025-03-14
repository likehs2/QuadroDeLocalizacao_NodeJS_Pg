// Variáveis globais
let modalNovoQuadro;

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o modal Bootstrap se existir
    const modalElement = document.getElementById('modalNovoQuadro');
    if (modalElement) {
        modalNovoQuadro = new bootstrap.Modal(modalElement);
    }
});

// Função para abrir o modal de novo quadro
function abrirModalNovoQuadro() {
    if (modalNovoQuadro) {
        modalNovoQuadro.show();
    }
}

// Função para criar um novo quadro
async function criarQuadro() {
    const nome = document.getElementById('nomeQuadro').value.trim();
    const descricao = document.getElementById('descricaoQuadro').value.trim();
    
    if (!nome) {
        alert('Por favor, informe um nome para o quadro.');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        
        const response = await fetch('/api/quadros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome, descricao })
        });
        
        if (response.ok) {
            // Recarregar a página para mostrar o novo quadro
            window.location.reload();
        } else {
            const error = await response.json();
            alert(`Erro ao criar quadro: ${error.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error('Erro ao criar quadro:', error);
        alert('Ocorreu um erro ao criar o quadro. Tente novamente mais tarde.');
    }
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}