document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (!token || !userJson) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent = 'Você precisa fazer login para acessar esta página.';
        return;
    }

    try {
        const user = JSON.parse(userJson);
        console.log('Usuário logado:', user);

        // Usando o ID do usuário e a flag admin para formar a URL
        const id = user.id;
        const admin = user.admin;

        // Fazer requisição para obter os quadros
        console.log('Token enviado:', token);
        const response = await fetch(`/api/quadros/tela/${id}/${admin}`);

        if (!response.ok) {
            throw new Error('Falha ao carregar quadros');
        }

        const quadros = await response.json();
        console.log('Quadros carregados:', quadros);

        // Esconder loading
        document.getElementById('loading').style.display = 'none';

        // Mostrar container de quadros
        const quadrosContainer = document.getElementById('quadros-container');
        quadrosContainer.style.display = 'block';

        if (Array.isArray(quadros)) {
            quadros.forEach(quadro => {
                const item = document.createElement('a');
                item.href = `/quadro/${quadro.id}`;
                item.className = 'list-group-item list-group-item-action';
                item.textContent = quadro.nome;
                listGroup.appendChild(item);
            });
        } else {
            console.error('Os dados não são um array:', quadros);
            // Aqui, você pode exibir uma mensagem de erro ou outro comportamento
        }
        

    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent = `Erro ao carregar quadros: ${error.message}`;
    }

    // Configurar botão de logout
    document.getElementById('logout-btn').addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    });
});
