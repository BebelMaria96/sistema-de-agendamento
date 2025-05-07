const express = require('express');
const path = require('path');
const app = express();
const db = require('./db');
const crypto = require('crypto');
const twilio = require('twilio');

const accountSid = 'ACe89d1fbf6dc2af6fa32db0d34bdcbb94';
const authToken = '3e59897a96ea82cb7c13708a4720c6e1';
const twilioClient = twilio(accountSid, authToken);


// Middlewares

app.use(express.static('public'));
app.use(express.json());


// ========================
// ROTAS DE LOGIN
// ========================


app.post('/login-profissional', (req, res) => {
  const { email, senha } = req.body;

  const sql = `
    SELECT id, nome 
    FROM profissionais 
    WHERE email = ? AND senha = ?
  `;

  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro no login do profissional:', err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }

    if (results.length === 1) {
      res.json({
        ok: true,
        id_profissional: results[0].id,
        nome: results[0].nome
      });
    } else {
      res.status(401).json({ ok: false, error: 'Credenciais inválidas' });
    }
  });
});


// ========================
// ROTAS DE AGENDAMENTO
// ========================


app.post('/agendar', (req, res) => {
  const {
    nome_responsavel,
    nome_crianca,
    idade_crianca,
    profissional,
    dataHora,
    email,
    telefone,
    observacoes
  } = req.body;

  console.log('\n=== DADOS RECEBIDOS NO AGENDAMENTO ===');
  console.log('req.body:', req.body);
  

  const idProf = parseInt(profissional);
  if (isNaN(idProf)) {
    return res.status(400).json({ error: 'ID do profissional inválido' });
  }

  const dataAgendada = new Date(dataHora);
  if (isNaN(dataAgendada)) {
    return res.status(400).json({ error: 'Data inválida' });
  }
  if (!profissional) {
    console.log('⚠️ Campo "profissional" está vazio ou não definido.');
    return res.status(400).json({ error: 'Profissional não especificado.' });
  }
  
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const diaSemana = diasSemana[dataAgendada.getDay()];
  const horaAgendada = dataHora.split('T')[1]?.substring(0, 5);
  if (!horaAgendada) {
    return res.status(400).json({ error: 'Horário inválido' });
  }

  const sqlProf = 'SELECT * FROM profissionais WHERE id = ?';
  db.query(sqlProf, [idProf], (err, result) => {
    if (err) {
      console.error('Erro ao buscar profissional:', err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    const prof = result[0];

    // LOGS COMPLETOS
    console.log('\n--- VERIFICAÇÃO DE DISPONIBILIDADE ---');
    console.log('Profissional:', prof.nome);
    console.log('DIA_TRABALHO (original do banco):', `"${prof.dias_trabalho}"`);
    console.log('HORARIO_INICIO:', `"${prof.horario_inicio}"`);
    console.log('HORARIO_FIM:', `"${prof.horario_fim}"`);

    const diasTrabalho = prof.dias_trabalho.split(',')
      .map(d => d.trim().toLowerCase());
    const diaAgendado = diaSemana.toLowerCase();

    const horaInicio = prof.horario_inicio.substring(0, 5);
    const horaFim = prof.horario_fim.substring(0, 5);

    // LOG extra
    console.log('--- VERIFICAÇÃO ---');
    console.log('Dia agendado:', diaSemana);
    console.log('Dias que trabalha:', diasTrabalho);
    console.log('Hora agendada:', horaAgendada);
    console.log('Início:', horaInicio, '| Fim:', horaFim);

    if (!diasTrabalho.includes(diaAgendado)) {
      return res.status(400).json({ error: 'Este profissional não atende neste dia.' });
    }

    if (horaAgendada < horaInicio || horaAgendada > horaFim) {
      return res.status(400).json({ error: 'Este profissional não atende neste horário.' });
    }

    // Verifica conflitos de agendamento
    const checarSQL = `
      SELECT * FROM dados_agendamento 
      WHERE id_profissional = ? AND data_hora = ?
    `;
    db.query(checarSQL, [idProf, dataHora], (err, results) => {
      if (err) {
        console.error('Erro ao verificar agendamento:', err);
        return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Horário já ocupado.' });
      }

      // Insere agendamento
      const inserirSQL = `
        INSERT INTO dados_agendamento
        (id_profissional, nome_responsavel, nome_crianca, idade_crianca, data_hora, email, telefone, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(inserirSQL, [
        idProf,
        nome_responsavel,
        nome_crianca,
        idade_crianca,
        dataHora,
        email,
        telefone,
        observacoes
      ], (err) => {
        if (err) {
          console.error('Erro ao salvar agendamento:', err);
          return res.status(500).json({ error: 'Erro ao salvar agendamento.' });
        }

        res.json({ status: 'ok' });

        const mensagem = `🗓️ Agendamento confirmado!

        👧 Criança: ${nome_crianca} (${idade_crianca} anos)
        👤 Responsável: ${nome_responsavel}
        📅 Data: ${new Date(dataHora).toLocaleString()}
        📞 Contato: ${telefone}
        💬 Observações: ${observacoes || 'Nenhuma'}
        
        Agradecemos pela confiança!
        – Clínica Luaris`;
        
        const telefoneFormatado = telefone.startsWith('+') ? telefone : `+55${telefone.replace(/\D/g, '')}`;
        
        twilioClient.messages
          .create({
            from: 'whatsapp:+14155238886',  // número padrão do sandbox do Twilio
            to: `whatsapp:${telefoneFormatado}`,
            body: mensagem
          })
          .then(message => console.log('✅ WhatsApp enviado! SID:', message.sid))
          .catch(error => console.error('❌ Erro ao enviar WhatsApp:', error));
        




      });
    });
  });
});


app.get('/agendamentos', (req, res) => {
  const sql = `
    SELECT a.*, p.nome AS nome_profissional 
    FROM dados_agendamento a
    JOIN profissionais p ON a.id_profissional = p.id
    ORDER BY a.data_hora ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar agendamentos:', err);
      return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
    res.json(results);
  });
});

app.delete('/agendamentos/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM dados_agendamento WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Erro ao deletar agendamento:', err);
      return res.status(500).json({ error: 'Erro ao deletar agendamento' });
    }
    res.json({ status: 'ok' });
  });
});


app.get('/agendamentos-profissional/:id', (req, res) => {
  const idProf = req.params.id;

  const sql = `
    SELECT * FROM dados_agendamento
    WHERE id_profissional = ?
    ORDER BY data_hora ASC
  `;

  db.query(sql, [idProf], (err, results) => {
    if (err) {
      console.error('Erro ao buscar agendamentos do profissional:', err);
      return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
    res.json(results);
  });
});


// ========================
// ROTAS DE MENSAGENS DE CONTATO
// ========================


app.post('/mensagem', (req, res) => {
  const { nome, email, mensagem } = req.body;

  const sql = `
    INSERT INTO mensagens_contato (nome, email, mensagem)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [nome, email, mensagem], (err) => {
    if (err) {
      console.error('Erro ao salvar mensagem:', err);
      return res.status(500).json({ error: 'Erro ao salvar mensagem' });
    }
    res.json({ status: 'ok' });
  });
});

app.get('/mensagens', (req, res) => {
  const sql = `SELECT * FROM mensagens_contato ORDER BY criado_em DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar mensagens:', err);
      return res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
    res.json(results);
  });
});

// ========================
// ROTAS DE SERVIÇOS
// ========================


app.get('/servicos', (req, res) => {
  const sql = 'SELECT * FROM servicos ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar serviços:', err);
      return res.status(500).json({ error: 'Erro ao buscar serviços' });
    }
    res.json(results);
  });
});

app.post('/servicos', (req, res) => {
  const { titulo, descricao } = req.body;

  const sql = 'INSERT INTO servicos (titulo, descricao) VALUES (?, ?)';
  db.query(sql, [titulo, descricao], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar serviço:', err);
      return res.status(500).json({ error: 'Erro ao adicionar serviço' });
    }
    res.json({ status: 'ok', id: result.insertId });
  });
});

app.put('/servicos/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descricao } = req.body;

  const sql = 'UPDATE servicos SET titulo = ?, descricao = ? WHERE id = ?';
  db.query(sql, [titulo, descricao, id], (err) => {
    if (err) {
      console.error('Erro ao atualizar serviço:', err);
      return res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
    res.json({ status: 'ok' });
  });
});

app.delete('/servicos/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM servicos WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Erro ao deletar serviço:', err);
      return res.status(500).json({ error: 'Erro ao deletar serviço' });
    }
    res.json({ status: 'ok' });
  });
});

// ========================
// ROTAS DE PROFISSIONAIS
// ========================


app.get('/profissionais', (req, res) => {
  db.query('SELECT * FROM profissionais ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Erro ao buscar profissionais:', err);
      return res.status(500).json({ error: 'Erro ao buscar profissionais' });
    }
    res.json(results);
  });
});

app.post('/profissionais', (req, res) => {
  const {
    nome,
    especialidade,
    email,
    telefone,
    horario_inicio,
    horario_fim,
    dias_trabalho,
    rede_social
  } = req.body;

  const sql = `
    INSERT INTO profissionais 
    (nome, especialidade, email, telefone, senha, dias_trabalho, horario_inicio, horario_fim, rede_social) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const senhaPadrao = 'luaris123';

  db.query(sql, [nome, especialidade, email, telefone, senhaPadrao, dias_trabalho, horario_inicio, horario_fim, rede_social], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar profissional:', err);
      return res.status(500).json({ error: 'Erro ao adicionar profissional' });
    }

    res.json({ status: 'ok', id: result.insertId });
  });
});



app.put('/profissionais/:id', (req, res) => {
  const { id } = req.params;
  const { nome, especialidade } = req.body;

  db.query('UPDATE profissionais SET nome = ?, especialidade = ? WHERE id = ?', [nome, especialidade, id], (err) => {
    if (err) {
      console.error('Erro ao atualizar profissional:', err);
      return res.status(500).json({ error: 'Erro ao atualizar profissional' });
    }
    res.json({ status: 'ok' });
  });
});

app.delete('/profissionais/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM profissionais WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Erro ao excluir profissional:', err);
      return res.status(500).json({ error: 'Erro ao excluir profissional' });
    }
    res.json({ status: 'ok' });
  });
});

// ========================
// INICIA SERVIDOR
// ========================


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
