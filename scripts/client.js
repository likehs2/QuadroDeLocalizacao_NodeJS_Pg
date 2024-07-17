document.addEventListener("DOMContentLoaded", function () {
    atualizarCoresDeTodosOsColaboradores();

    // ----------WebSocket
    const socket = new WebSocket(`ws://${window.location.host}`);

    socket.onopen = function (event) {
        console.log("Conexão WebSocket estabelecida");
    };

    socket.onmessage = function (event) {
        const dadosAtualizados = JSON.parse(event.data);
        console.log("Dados recebidos via WebSocket:", dadosAtualizados);
        atualizarColaborador(dadosAtualizados);
    };

    socket.onclose = function (event) {
        console.log("Conexão WebSocket fechada");
    };

    socket.onerror = function (error) {
        console.error("Erro no WebSocket:", error);
    };

    document.querySelectorAll(".colaborador").forEach(colaborador => {
        colaborador.addEventListener("click", function (event) {

        });
    });
});


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

function atualizarCoresDeTodosOsColaboradores() {
    document.querySelectorAll(".colaborador").forEach(colaborador => {
        let status = colaborador.querySelector('h3').textContent.toLowerCase().trim();
        status = status.replace(/[^a-zA-Zãí]/g, '');
        atualizarCorStatus(colaborador, status);
    });
}


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
    atualizarCoresDeTodosOsColaboradores();
}

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

function atualizarColaborador(dados) {
    const colaboradorElement = document.getElementById(`colaborador-${dados.id}`);

    if (colaboradorElement) {
        const localizacaoElement = colaboradorElement.querySelector('h2');
        const statusElement = colaboradorElement.querySelector('h3');
        const imagemElement = colaboradorElement.querySelector('img');

        if (dados.localizacao) {
            localizacaoElement.textContent = dados.localizacao;
        }
        if (dados.status) {
            statusElement.textContent = dados.status;
            atualizarCorStatus(colaboradorElement, dados.status.toLowerCase());
        }
        if (dados.imagemUrl) {
            imagemElement.src = dados.imagemUrl;
        }
    } else {
        const colaboradorContainer = document.getElementById('colaboradores-container');
        const div = document.createElement('div');
        div.classList.add('colaborador');
        div.id = `colaborador-${dados.id}`;
        div.innerHTML = `
            <img src="${dados.imagemUrl}" alt="Imagem do Colaborador"> <!-- Adiciona a imagem -->
            <h1>${dados.nome}</h1>
            <h2>${dados.localizacao}</h2>
            <h3 class="status ${dados.status}">${dados.status}</h3>
        `;
        colaboradorContainer.appendChild(div);
    }
    atualizarCoresDeTodosOsColaboradores();
}
