// scripts/client.js

document.addEventListener("DOMContentLoaded", function () {
    atualizarCoresDeTodosOsColaboradores();
    document.querySelectorAll(".colaborador").forEach(colaborador => {
        colaborador.addEventListener("click", function (event) {
            // Lógica para manipular o clique no colaborador, se necessário
        });
    });
});

// Função para atualizar o status de um colaborador
async function atualizarStatus(id, novaLocalizacao) {
    const newStatus = (novaLocalizacao === null || novaLocalizacao.toLowerCase() === "presente") ? 'disponível' : 'indisponível';

    try {
        const response = await fetch(`/colaboradores/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
            // Atualiza a interface após a atualização no servidor
            const colaboradorElement = document.getElementById(`colaborador-${id}`);
            const statusElement = colaboradorElement.querySelector('h3');
            statusElement.textContent = newStatus;
            atualizarCorStatus(colaboradorElement, newStatus.toLowerCase());


        } else {
            alert('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro ao atualizar status', error);
    }
}

// Função para editar a localização de um colaborador
async function editarLocalizacao(id) {
    const colaboradorDiv = document.getElementById(`colaborador-${id}`);
    const novaLocalizacao = prompt("Informe a nova localização:");

    if (novaLocalizacao !== null) {
        try {
            const response = await fetch(`/colaboradores/${id}/localizacao`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ localizacao: novaLocalizacao })
            });

            if (response.ok) {
                // Atualiza a interface com a nova localização
                const localizacaoElement = colaboradorDiv.querySelector('h2');
                localizacaoElement.textContent = novaLocalizacao;
                atualizarStatus(id, novaLocalizacao);
            } else {
                console.error('Erro ao atualizar localização');
            }
        } catch (error) {
            console.error('Erro ao atualizar localização', error);
        }
    }
}

// Função para atualizar as cores de todos os colaboradores
function atualizarCoresDeTodosOsColaboradores() {
    document.querySelectorAll(".colaborador").forEach(colaborador => {
        let status = colaborador.querySelector('h3').textContent.toLowerCase().trim();
        
        // Remover caracteres indesejados
        status = status.replace(/[^a-zA-Zãí]/g, '');
        atualizarCorStatus(colaborador, status);
    });
}

// Função para atualizar a lista de colaboradores na interface
function atualizarListaColaboradores(colaboradores) {
    const colaboradoresContainer = document.getElementById('colaboradores-container');
    colaboradoresContainer.innerHTML = '';

    colaboradores.forEach(colaborador => {
        const div = document.createElement('div');
        div.classList.add('colaborador');
        div.innerHTML = `
            <h1>${colaborador.nome}</h1>
            <h2>${colaborador.localizacao}</h2>
            <h3 class="status ${colaborador.status}">${colaborador.status}</h3>
        `;
        colaboradoresContainer.appendChild(div);
    });

    // Atualiza as cores de todos os colaboradores após atualizar a lista
    atualizarCoresDeTodosOsColaboradores();
}

// Função para atualizar a cor do status de um colaborador
function atualizarCorStatus(elemento, status) {
    let h1 = elemento.querySelector("h1");
    let h2 = elemento.querySelector("h2");
    let h3 = elemento.querySelector("h3");

    if (status === "indisponível") {
        h1.style.backgroundColor = "#fd5c63";
        h2.style.backgroundColor = "#fd5c63";
        h3.style.backgroundColor = "#fd5c63";
    } else {
        h1.style.backgroundColor = "#90EE90";
        h2.style.backgroundColor = "#90EE90";
        h3.style.backgroundColor = "#90EE90";
    }
}
