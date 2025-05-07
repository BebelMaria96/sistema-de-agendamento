document.addEventListener('DOMContentLoaded', () => {
  // MENU LATERAL
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('side-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }

  // FORMULÁRIO DE AGENDAMENTO
  const formAgendamento = document.getElementById('form-agendamento');
  if (formAgendamento) {
    formAgendamento.addEventListener('submit', async (e) => {
      e.preventDefault();

      const profissional = document.getElementById('profissional').value;
      const dataHora = document.getElementById('dataHora').value;

      try {
        const response = await fetch('/agendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome_responsavel: document.getElementById('responsavel').value,
            nome_crianca: document.getElementById('crianca').value,
            idade_crianca: parseInt(document.getElementById('idade').value),
            profissional,
            dataHora,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            observacoes: document.getElementById('obs').value
          })
        });

        const result = await response.json();

        if (response.ok) {
          alert("Agendamento confirmado!");
          formAgendamento.reset();
        } else {
          alert(result.error || "Erro ao agendar.");
        }
      } catch (err) {
        console.error("Erro na requisição:", err);
        alert("Erro ao se comunicar com o servidor.");
      }
    });
  }

  // FORMULÁRIO DE CONTATO
  const formContato = document.getElementById('form-contato');
  if (formContato) {
    formContato.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const response = await fetch('/mensagem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            mensagem: document.getElementById('mensagem').value
          })
        });

        if (response.ok) {
          alert("Mensagem enviada com sucesso!");
          formContato.reset();
        } else {
          alert("Erro ao enviar mensagem.");
        }
      } catch (err) {
        console.error("Erro ao enviar mensagem:", err);
        alert("Erro ao se comunicar com o servidor.");
      }
    });
  }
});
