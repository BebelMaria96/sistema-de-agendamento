document.addEventListener('DOMContentLoaded', () => {
  // ========== SERVIÇOS ==========
  const formServico = document.getElementById('form-servico');
  const listaServicos = document.getElementById('lista-servicos');

  if (formServico) {
    formServico.addEventListener('submit', async (e) => {
      e.preventDefault();

      const titulo = document.getElementById('titulo-servico').value;
      const descricao = document.getElementById('descricao-servico').value;

      const res = await fetch('/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao })
      });

      if (res.ok) {
        formServico.reset();
        carregarServicos();
      } else {
        alert("Erro ao adicionar serviço.");
      }
    });
  }

  async function carregarServicos() {
    if (!listaServicos) return;

    listaServicos.innerHTML = '';
    const res = await fetch('/servicos');
    const servicos = await res.json();

    servicos.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${s.titulo}</strong><br>${s.descricao}<br>
        <button onclick="editarServico(${s.id}, '${s.titulo}', \`${s.descricao}\`)">✏️ Editar</button>
        <button onclick="excluirServico(${s.id})">🗑️ Excluir</button>
      `;
      listaServicos.appendChild(li);
    });
  }

  window.editarServico = async function (id, titulo, descricao) {
    const novoTitulo = prompt("Novo título:", titulo);
    const novaDescricao = prompt("Nova descrição:", descricao);

    if (novoTitulo && novaDescricao) {
      const res = await fetch(`/servicos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: novoTitulo, descricao: novaDescricao })
      });
      if (res.ok) carregarServicos();
    }
  };

  window.excluirServico = async function (id) {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      const res = await fetch(`/servicos/${id}`, { method: 'DELETE' });
      if (res.ok) carregarServicos();
    }
  };

  carregarServicos();

  // ========== PROFISSIONAIS ==========
  
  const formProf = document.getElementById('form-profissional');
  const listaProfissionais = document.getElementById('lista-profissionais');
  
  if (formProf) {
    formProf.addEventListener('submit', async (e) => {
      e.preventDefault();
    
      const nome = document.getElementById('nome-profissional').value;
      const especialidade = document.getElementById('especialidade-profissional').value;
      const email = document.getElementById('email-profissional').value;
      const telefone = document.getElementById('telefone-profissional').value;
      const horario_inicio = document.getElementById('horario-inicio').value;
      const horario_fim = document.getElementById('horario-fim').value;
      const rede_social = document.getElementById('rede-social-profissional').value;

    
      const diasSelecionados = Array.from(document.querySelectorAll('.dias-checkboxes input[type="checkbox"]'))
      .filter(cb => cb.checked)
      .map(cb => cb.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
      .join(', ');
    
    
      const res = await fetch('/profissionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          especialidade,
          email,
          telefone,
          rede_social,
          horario_inicio,
          horario_fim,
          dias_trabalho: diasSelecionados
        })
      });
    
      if (res.ok) {
        formProf.reset();
        carregarProfissionais();
      } else {
        alert("Erro ao adicionar profissional.");
      }
    });
    
  }
  
  async function carregarProfissionais() {
    if (!listaProfissionais) return;
  
    listaProfissionais.innerHTML = '';
    const res = await fetch('/profissionais');
    const profissionais = await res.json();
  
    profissionais.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${p.nome}</strong> – ${p.especialidade}<br>
        ${p.email} | ${p.telefone}<br>
        Rede social: ${p.rede_social}<br>
        🗓️ Dias: ${p.dias_trabalho}<br>
        ⏰ ${p.horario_inicio?.substring(0,5)} – ${p.horario_fim?.substring(0,5)}<br>
        <button onclick="editarProfissional(${p.id}, '${p.nome}', '${p.especialidade}')">✏️ Editar</button>
        <button onclick="excluirProfissional(${p.id})">🗑️ Excluir</button>`; 
  
      listaProfissionais.appendChild(li);
    });
  }

  

  window.editarProfissional = async function (id, nome, especialidade) {
    const novoNome = prompt("Novo nome:", nome);
    const novaEspecialidade = prompt("Nova especialidade:", especialidade);

    if (novoNome && novaEspecialidade) {
      const res = await fetch(`/profissionais/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome, especialidade: novaEspecialidade })
      });
      if (res.ok) carregarProfissionais();
    }
  };

  window.excluirProfissional = async function (id) {
    if (confirm("Tem certeza que deseja excluir este profissional?")) {
      const res = await fetch(`/profissionais/${id}`, { method: 'DELETE' });
      if (res.ok) carregarProfissionais();
    }
  };

  carregarProfissionais();

  // ========== AGENDAMENTOS ==========
  const listaAgendamentos = document.getElementById('lista-agendamentos');

  async function carregarAgendamentos() {
    if (!listaAgendamentos) return;

    listaAgendamentos.innerHTML = '';
    const res = await fetch('/agendamentos');
    const agendamentos = await res.json();

    agendamentos.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${a.nome_crianca}</strong> com <strong>${a.nome_profissional}</strong><br>
        Responsável: ${a.nome_responsavel} | ${a.telefone}<br>
        ${new Date(a.data_hora).toLocaleString()}<br>
        <button onclick="deletarAgendamento(${a.id})">🗑️ Excluir</button>
      `;
      listaAgendamentos.appendChild(li);
    });
  }

  window.deletarAgendamento = function (id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      fetch(`/agendamentos/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(result => {
          if (result.status === 'ok') {
            alert('Agendamento excluído.');
            carregarAgendamentos();
          } else {
            alert('Erro ao excluir agendamento.');
          }
        });
    }
  };

  carregarAgendamentos();

  // ========== MENSAGENS ==========
  const listaMensagens = document.getElementById('lista-mensagens');

  async function carregarMensagens() {
    if (!listaMensagens) return;

    listaMensagens.innerHTML = '';
    const res = await fetch('/mensagens');
    const mensagens = await res.json();

    mensagens.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${m.nome}</strong> (${m.email})<br>
        <em>${new Date(m.criado_em).toLocaleString()}</em><br>
        <p>${m.mensagem}</p>
        <hr>
      `;
      listaMensagens.appendChild(li);
    });
  }

  carregarMensagens();
});
