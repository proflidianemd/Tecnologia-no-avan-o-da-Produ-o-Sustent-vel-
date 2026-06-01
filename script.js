document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. GERENCIAMENTO DO ACCORDION INTERATIVO
    // ==========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const contentId = header.getAttribute('aria-controls');
            const contentPanel = document.getElementById(contentId);

            // Fecha todos os painéis abertos antes (Comportamento Clássico Exclusivo)
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    document.getElementById(otherHeader.getAttribute('aria-controls')).setAttribute('hidden', '');
                }
            });

            // Altera estado do item clicado
            if (isExpanded) {
                header.setAttribute('aria-expanded', 'false');
                contentPanel.setAttribute('hidden', '');
            } else {
                header.setAttribute('aria-expanded', 'true');
                contentPanel.removeAttribute('hidden');
            }
        });
    });

    // ==========================================
    // 2. CAIXA DE ACESSIBILIDADE FLUTUANTE
    // ==========================================
    let tamanhoFonteAtual = 100; // Porcentagem inicial
    const rootElement = document.documentElement;
    const btnAumentar = document.getElementById('btn-aumentar-fonte');
    const btnDiminuir = document.getElementById('btn-diminuir-fonte');
    const btnTema = document.getElementById('btn-toggle-tema');
    const btnOuvir = document.getElementById('btn-ouvir-voz');
    const btnParar = document.getElementById('btn-parar-voz');

    // Aumentar / Diminuir Fonte
    btnAumentar.addEventListener('click', () => {
        if (tamanhoFonteAtual < 130) {
            tamanhoFonteAtual += 5;
            rootElement.style.fontSize = `${tamanhoFonteAtual}%`;
        }
    });

    btnDiminuir.addEventListener('click', () => {
        if (tamanhoFonteAtual > 85) {
            tamanhoFonteAtual -= 5;
            rootElement.style.fontSize = `${tamanhoFonteAtual}%`;
        }
    });

    // Alternador de Tema (Claro / Escuro)
    btnTema.addEventListener('click', () => {
        rootElement.classList.toggle('modo-claro');
    });

    // ==========================================
    // 3. ACCESSIBILIDADE: SPEECH SYNTHESIS (LEITURA DE VOZ)
    // ==========================================
    let sotaqueVoz = null;

    // Tenta carregar a API de Voz Nativa do Navegador
    function carregarVozes() {
        if ('speechSynthesis' in window) {
            const vozes = window.speechSynthesis.getVoices();
            // Filtra por vozes em português brasileiro
            sotaqueVoz = vozes.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
        }
    }
    
    carregarVozes();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = carregarVozes;
    }

    btnOuvir.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            // Cancela leituras anteriores ativas para evitar sobreposição
            window.speechSynthesis.cancel();

            // Captura exclusivamente o conteúdo textual principal solicitado
            const principal = document.getElementById('conteudo-principal');
            const textoParaLer = principal.innerText;

            const utterance = new SpeechSynthesisUtterance(textoParaLer);
            if (sotaqueVoz) utterance.voice = sotaqueVoz;
            utterance.rate = 1.0; // Velocidade equilibrada

            // Controle de Estados dos Botões
            utterance.onstart = () => {
                btnOuvir.disabled = true;
                btnParar.disabled = false;
            };

            utterance.onend = () => {
                btnOuvir.disabled = false;
                btnParar.disabled = true;
            };

            utterance.onerror = () => {
                btnOuvir.disabled = false;
                btnParar.disabled = true;
            };

            window.speechSynthesis.speak(utterance);
        } else {
            alert('A API de leitura por voz não é suportada neste navegador.');
        }
    });

    btnParar.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            btnOuvir.disabled = false;
            btnParar.disabled = true;
        }
    });

    // ==========================================
    // 4. ENVIO DO FORMULÁRIO DE INSCRIÇÃO DO SEMINÁRIO
    // ==========================================
    const formSeminario = document.getElementById('form-seminario');
    const msgSucesso = document.getElementById('msg-sucesso-form');

    formSeminario.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulação de envio seguro de dados
        const dadosForm = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value,
            pais: document.getElementById('pais').value
        };

        console.log('Inscrição do AgroFuturo processada:', dadosForm);
        
        msgSucesso.removeAttribute('hidden');
        formSeminario.reset();

        setTimeout(() => {
            msgSucesso.setAttribute('hidden', '');
        }, 5000);
    });

    // ==========================================
    // 5. CAIXA INTERATIVA DE COMENTÁRIOS DO LEITOR
    // ==========================================
    const formComentario = document.getElementById('form-comentario');
    const txtComentario = document.getElementById('txt-comentario');
    const listaComentarios = document.getElementById('lista-comentarios');

    formComentario.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const comentarioTexto = txtComentario.value.trim();
        if (comentarioTexto === '') return;

        // Cria dinamicamente a div do comentário respeitando a acessibilidade
        const item = document.createElement('div');
        item.classList.add('comentario-item');
        
        // Formata data atual
        const hoje = new Date().toLocaleDateString('pt-BR');

        item.innerHTML = `
            <p style="font-size:0.9rem; color:var(--cor-ouro); font-weight:600; margin-bottom:4px;">Leitor Anônimo — ${hoje}</p>
            <p style="color:var(--cor-branco); font-size:1rem;">${comentarioTexto}</p>
        `;

        // Se estiver no modo claro, ajusta a cor do texto injetado imediatamente
        if(rootElement.classList.contains('modo-claro')) {
            setTimeout(() => {
                item.querySelector('p:nth-child(2)').style.color = '#121212';
            }, 10);
        }

        listaComentarios.prepend(item); // Insere no topo
        txtComentario.value = '';
    });
});