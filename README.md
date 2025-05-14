É preciso:

1. Instalar node.js e express
2. xampp para uso de Apache e Mysql
3. Criar banco de dados e adicionar as tabelas necessarias:

CREATE DATABASE IF NOT EXISTS agendamento_luaris;
USE agendamento_luaris;



CREATE TABLE IF NOT EXISTS profissionais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  senha VARCHAR(100) NOT NULL,
  dias_trabalho VARCHAR(100) NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  rede_social VARCHAR(255) DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS dados_agendamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_profissional INT NOT NULL,
  nome_responsavel VARCHAR(100) NOT NULL,
  nome_crianca VARCHAR(100) NOT NULL,
  idade_crianca INT NOT NULL,
  data_hora DATETIME NOT NULL,
  email VARCHAR(100),
  telefone VARCHAR(20),
  observacoes TEXT,
  FOREIGN KEY (id_profissional) REFERENCES profissionais(id)
    ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL
);




CREATE TABLE IF NOT EXISTS mensagens_contato (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


