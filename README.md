A ideia inicial do Quadro de localização virtual, é subistituir o quadro branco físico, em que os colaboradores anotam com um pincel atômico a localização em que estarão, por exemplo "WC, Em reunião, Contabilidade, RH,", para que outro colaborador possa encontralo em alguma emergência ou necessidade
![1](https://github.com/user-attachments/assets/12319443-088b-4b36-a095-16023d705fe7)
Sendo possível cadastrar um novo colaborador para compor o quadro, como mostra abaixo:
![2](https://github.com/user-attachments/assets/781e338a-8478-455c-9e38-9df51bfe65f4)
Ao clicar com o botão direito sobre algum colaborador já cadastrado, é listado as opções de deleta-lo ou alterar sua imagem:
![3](https://github.com/user-attachments/assets/96c7e009-4b34-4678-b94f-62e3401a3825)
Ao clicar em cima da foto do colaborador, é aberto um prompt para digitar a nova localização:
![4](https://github.com/user-attachments/assets/e0f48b45-7eca-4761-89f6-730df262c034)
![5](https://github.com/user-attachments/assets/e7ce4165-38fc-4a6f-a30b-c465978a2691)

O Quadro de localização virtual utiliza o banco PostgresSQL como SGBD, e WebSocket para atualização do status em tempo real para o lado do cliente.


CREATE DATABASE localizacao_colaboradores;

CREATE TABLE colaboradores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  localizacao VARCHAR(100) NOT NULL,
  imagem TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'disponível'
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quadros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_quadro (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    quadro_id INTEGER REFERENCES quadros(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, quadro_id)
);