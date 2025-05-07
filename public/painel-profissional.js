document.addEventListener('DOMContentLoaded', async () => {
  const idProfissional = localStorage.getItem('id_profissional');
  const nome = localStorage.getItem('nome_profissional');

  if (!idProfissional) {
    alert('Acesso não autorizado.');
    window.location.href = 'login-profissional.html';
    return;
  }

  document.getElementById('nome-profissional').innerText = nome;

  try {
    const res = await fetch(`/agendamentos-profissional/${idProfissional}`);
    const agendamentos = await res.json();

    const lista = document.getElementById('lista-agendamentos-prof');
    lista.innerHTML = '';

    agendamentos.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${a.nome_crianca}</strong> – ${new Date(a.data_hora).toLocaleString()}<br>
        Responsável: ${a.nome_responsavel} | ${a.telefone}<br>
        Observações: ${a.observacoes || 'Nenhuma'}
      `;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    alert('Erro ao carregar agendamentos.');
  }
});
