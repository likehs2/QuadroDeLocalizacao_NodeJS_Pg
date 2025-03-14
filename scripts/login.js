document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form_main');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: username,
                    senha: password
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Salvar token e informações do usuário no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.id,
                    nome: data.nome,
                    email: data.email,
                    admin: data.admin
                }));
                
                // Redirecionar para a página de seleção de quadros
                window.location.href = '/quadros';
            } else {
                const error = await response.json();
                alert(`Erro: ${error.message || 'Credenciais inválidas'}`);
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
        }
    });
});