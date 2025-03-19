document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');

    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // IMPEDINDO O RECARREGAMENTO DA PÁGINA
        console.log("Interceptando formulário...");

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            console.log('Enviando requisição de login...');
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, senha: password })
            });

            console.log('Resposta recebida:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Login bem-sucedido:', data);

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.id,
                    nome: data.nome,
                    email: data.email,
                    admin: data.admin
                }));

                console.log('Redirecionando para /quadros...');
                window.location.href = `/api/quadros/acesso/${data.id}/${data.admin}`;

            } else {
                const error = await response.json();
                console.error('Erro na resposta:', error);
                alert(`Erro: ${error.message || 'Credenciais inválidas'}`);
            }

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
        }
    });
});
