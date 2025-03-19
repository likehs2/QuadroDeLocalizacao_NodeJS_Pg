let userId = null;
let idDoQuadro = 0;

document.addEventListener('click', function (event) {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu.contains(event.target)) {
        contextMenu.classList.remove('active');

    }
});

document.addEventListener("DOMContentLoaded", function () {
    atualizarCoresDeTodosOsColaboradores();
    const idQuadro = document.body.getAttribute('data-id-quadro');
    idDoQuadro = idQuadro;
    const userData = localStorage.getItem("user");
    if (userData) {
        const user = JSON.parse(userData);
        if (user.admin) {
            document.getElementById("botaocriar").style.display = "block";
        }
    }

    // WebSocket
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

let colaboradorIdParaAlterarImagem;

function showContextMenu(event, colaboradorId) {
    event.preventDefault();
    console.log('Botão direito clicado em colaborador', colaboradorId);
    const userData = localStorage.getItem("user");
    if (userData) {
        const user = JSON.parse(userData);
        const isAdmin = user.admin;

        console.log("Usuário é admin?", isAdmin);
        if (isAdmin == true) {
            const contextMenu = document.getElementById('context-menu');
            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.classList.add('active');

            const deleteOption = document.getElementById('delete-option');
            deleteOption.onclick = function () {
                deletarColaborador(colaboradorId);
            };
            const alterarOption = document.getElementById('alterar-option');
            alterarOption.onclick = function () {
                colaboradorIdParaAlterarImagem = colaboradorId;
                abrirModalAlterarImagem();
            };
        }
    } else {
        console.log("Nenhum usuário encontrado no localStorage.");
    }
}

function abrirModalAlterarImagem() {
    const modal = document.getElementById('modal-alterar-imagem');
    modal.style.display = 'block';
}

function fecharModalAlterarImagem() {
    const modal = document.getElementById('modal-alterar-imagem');
    modal.style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('modal-alterar-imagem');
    if (event.target === modal) {
        fecharModalAlterarImagem();
    }
}

async function alterarImagemColaborador() {
    const novaImagemInput = document.getElementById('nova-imagem');
    const novaImagem = novaImagemInput.files[0];

    if (!novaImagem) {
        alert('Selecione uma nova imagem.');
        return;
    }

    const formData = new FormData();
    formData.append('imagem', novaImagem);

    try {
        const response = await fetch(`/colaboradores/${colaboradorIdParaAlterarImagem}/imagem`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            const resultado = await response.json();
            const colaboradorDiv = document.getElementById(`colaborador-${colaboradorIdParaAlterarImagem}`);
            const imgElement = colaboradorDiv.querySelector('img');
            imgElement.src = resultado.imagem;

            fecharModalAlterarImagem();
        } else {
            console.error('Erro ao alterar imagem do colaborador');
        }
    } catch (error) {
        console.error('Erro ao alterar imagem do colaborador', error);
    }
}

async function deletarColaborador(colaboradorId) {

    try {
        const response = await fetch(`/colaboradores/${colaboradorId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            const colaboradorDiv = document.getElementById(`colaborador-${colaboradorId}`);
            colaboradorDiv.remove();
        } else {
            console.error('Erro ao deletar colaborador');
        }
    } catch (error) {
        console.error('Erro ao deletar colaborador', error);
    }
}

async function atualizarStatus(id, novaLocalizacao) {
    const newStatus = (novaLocalizacao === "" || novaLocalizacao.toLowerCase() === "presente") ? 'disponível' : 'indisponível';

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
        if (novaLocalizacao !== "") {
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
        } else {
            var novaLocalizacaoAux = "presente";
            try {
                const response = await fetch(`/colaboradores/${id}/localizacao`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ localizacao: novaLocalizacaoAux })
                });

                if (response.ok) {
                    const localizacaoElement = colaboradorDiv.querySelector('h2');
                    localizacaoElement.textContent = novaLocalizacaoAux;
                    atualizarStatus(id, novaLocalizacaoAux);
                } else {
                    console.error('Erro ao atualizar localização');
                }
            } catch (error) {
                console.error('Erro ao atualizar localização', error);
            }
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

function abrirModal() {
    document.getElementById('modal-colaborador').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal-colaborador').style.display = 'none';
    location.reload();
}

window.onclick = function (event) {
    if (event.target === document.getElementById('modal-colaborador')) {
        fecharModal();
    }
}

async function adicionarColaborador() {
    const nome = document.getElementById('nome').value;
    const localizacao = document.getElementById('localizacao').value;
    const imagemInput = document.getElementById('imagem');
    const imagem = imagemInput.files[0];
    const quadro_id = idDoQuadro

    if (!nome || !localizacao || !imagem) {
        alert('Todos os campos são obrigatórios.');
        return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('localizacao', localizacao);
    formData.append('imagem', imagem);
    formData.append('quadro_id', quadro_id);

    const status = (localizacao.toLowerCase() === "presente") ? 'disponível' : 'indisponível';
    formData.append('status', status);

    try {
        const response = await fetch('/colaboradores', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const novoColaborador = await response.json();
            const colaboradorContainer = document.getElementById('colaboradores-container');

            const colaboradorDiv = document.createElement('div');
            colaboradorDiv.classList.add('colaborador');
            colaboradorDiv.id = `colaborador-${novoColaborador.id}`;

            colaboradorDiv.innerHTML = `
                <img src="${novoColaborador.imagem}" alt="Imagem de ${novoColaborador.nome}" onclick="editarLocalizacao(${novoColaborador.id})">
                <h1>${novoColaborador.nome}</h1>
                <h2>${novoColaborador.localizacao}</h2>
                <h3 class="status ${novoColaborador.status}">${novoColaborador.status}</h3>
            `;

            colaboradorContainer.appendChild(colaboradorDiv);
            atualizarCorStatus(colaboradorDiv, novoColaborador.status.toLowerCase());

        } else {
            console.error('Erro ao adicionar colaborador');
        }
    } catch (error) {
        console.error('Erro ao adicionar colaborador', error);
    }
    fecharModal();
}
