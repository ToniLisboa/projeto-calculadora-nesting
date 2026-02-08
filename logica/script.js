// Banco de Materiais
const MATERIAIS = {
    "Acrilico": 1.19,
    "Petg Cristal": 1.27,
    "PS": 1.07,
    "PP": 0.95,
    "PVC": 1.33,
    "MDF (Aprox)": 0.75,
    "ACM (Aprox)": 1.35,
    "Outro": 1.00
};

// Tamanhos Padrão
const TAMANHOS_PADRAO = {
    "personalizado": [0, 0],
    "200x100": [200, 100],
    "300x200": [300, 200],
    "122x244": [122, 244],
    "100x100": [100, 100]
};

// Cores para as peças
const CORES_PECAS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6',
    '#1abc9c', '#f39c12', '#d35400', '#c0392b',
    '#8e44ad', '#16a085', '#27ae60', '#2980b9'
];

// Estado da aplicação
let pecas = [];
let resultados = null;
let chartInstance = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    atualizarDensidade();
    carregarPecasExemplo();
    renderizarTabelaPecas();
});

function inicializarEventos() {
    // Tamanho padrão da chapa
    document.getElementById('tamanhoPadrao').addEventListener('change', function() {
        const valor = this.value;
        if (valor !== 'personalizado') {
            const [largura, altura] = TAMANHOS_PADRAO[valor];
            document.getElementById('larguraChapa').value = largura;
            document.getElementById('alturaChapa').value = altura;
        }
    });

    // Material
    document.getElementById('material').addEventListener('change', atualizarDensidade);

    // Adicionar peça
    document.getElementById('adicionarPeca').addEventListener('click', adicionarPeca);

    // Calcular otimização
    document.getElementById('calcular').addEventListener('click', calcularOtimizacao);

    // Exportar resultados
    document.getElementById('exportBtn').addEventListener('click', exportarResultados);
    
    // Toggle para rotacionadas
    document.getElementById('toggleRotacionar').addEventListener('change', function() {
        if (resultados) {
            renderizarChapas();
        }
    });
}

function atualizarDensidade() {
    const materialSelect = document.getElementById('material');
    const densidade = materialSelect.value;
    document.getElementById('densidadeValor').textContent = densidade;
}

function carregarPecasExemplo() {
    // Adiciona algumas peças de exemplo
    pecas = [
        { id: 1, largura: 30, altura: 20, quantidade: 4, cor: CORES_PECAS[0] },
        { id: 2, largura: 25, altura: 15, quantidade: 6, cor: CORES_PECAS[1] },
        { id: 3, largura: 40, altura: 30, quantidade: 2, cor: CORES_PECAS[2] },
        { id: 4, largura: 15, altura: 10, quantidade: 8, cor: CORES_PECAS[3] }
    ];
}

function renderizarTabelaPecas() {
    const tbody = document.getElementById('pecasBody');
    tbody.innerHTML = '';

    pecas.forEach((peca, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Peça">
                <div class="item-color" style="background-color: ${peca.cor};"></div>
                ${index + 1}
            </td>
            <td data-label="Largura (cm)">${peca.largura.toFixed(1)}</td>
            <td data-label="Altura (cm)">${peca.altura.toFixed(1)}</td>
            <td data-label="Quantidade">${peca.quantidade}</td>
            <td data-label="Ações">
                <button onclick="removerPeca(${index})" class="btn" style="padding: 5px 10px; background-color: #e74c3c; color: white; font-size: 0.9rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function adicionarPeca() {
    const largura = parseFloat(document.getElementById('novaLargura').value);
    const altura = parseFloat(document.getElementById('novaAltura').value);
    const quantidade = parseInt(document.getElementById('novaQuantidade').value);

    if (isNaN(largura) || largura <= 0) {
        mostrarErro('Por favor, insira uma largura válida maior que zero.');
        return;
    }

    if (isNaN(altura) || altura <= 0) {
        mostrarErro('Por favor, insira uma altura válida maior que zero.');
        return;
    }

    if (isNaN(quantidade) || quantidade <= 0) {
        mostrarErro('Por favor, insira uma quantidade válida maior que zero.');
        return;
    }

    // Adiciona a nova peça
    const novaPeca = {
        id: pecas.length + 1,
        largura,
        altura,
        quantidade,
        cor: CORES_PECAS[pecas.length % CORES_PECAS.length]
    };

    pecas.push(novaPeca);
    renderizarTabelaPecas();

    // Limpar campos
    document.getElementById('novaLargura').value = '';
    document.getElementById('novaAltura').value = '';
    document.getElementById('novaQuantidade').value = 1;

    mostrarSucesso('Peça adicionada com sucesso!');
}

function removerPeca(index) {
    pecas.splice(index, 1);
    renderizarTabelaPecas();
    mostrarSucesso('Peça removida com sucesso!');
}

function mostrarSucesso(mensagem) {
    const alert = document.getElementById('successAlert');
    alert.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

function mostrarErro(mensagem) {
    const alert = document.getElementById('errorAlert');
    document.getElementById('errorMessage').textContent = mensagem;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function calcularOtimizacao() {
    // Validações
    const larguraChapa = parseFloat(document.getElementById('larguraChapa').value);
    const alturaChapa = parseFloat(document.getElementById('alturaChapa').value);
    const espessura = parseFloat(document.getElementById('espessura').value);
    const corte = parseFloat(document.getElementById('corte').value);

    if (isNaN(larguraChapa) || larguraChapa <= 0) {
        mostrarErro('Por favor, insira uma largura de chapa válida.');
        return;
    }

    if (isNaN(alturaChapa) || alturaChapa <= 0) {
        mostrarErro('Por favor, insira uma altura de chapa válida.');
        return;
    }

    if (pecas.length === 0) {
        mostrarErro('Adicione pelo menos uma peça para calcular a otimização.');
        return;
    }

    // Mostrar loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultados').style.display = 'none';

    // Simular processamento (em um caso real, aqui seria o algoritmo de nesting)
    setTimeout(() => {
        executarAlgoritmoNesting(larguraChapa, alturaChapa, espessura, corte);
    }, 500);
}

function executarAlgoritmoNesting(larguraChapa, alturaChapa, espessura, corte) {
    // Preparar lista de peças para o algoritmo
    const pecasParaCorte = [];
    pecas.forEach(peca => {
        for (let i = 0; i < peca.quantidade; i++) {
            pecasParaCorte.push({
                id: peca.id,
                largura: peca.largura,
                altura: peca.altura,
                cor: peca.cor
            });
        }
    });

    // Ordenar peças por área (maior primeiro)
    pecasParaCorte.sort((a, b) => (b.largura * b.altura) - (a.largura * a.altura));

    // Algoritmo de nesting simples (First-Fit Decreasing Height)
    const chapas = [];
    let pecasRestantes = [...pecasParaCorte];
    
    while (pecasRestantes.length > 0) {
        const chapa = {
            largura: larguraChapa,
            altura: alturaChapa,
            pecas: [],
            espacos: [{ x: 0, y: 0, largura: larguraChapa, altura: alturaChapa }],
            areaOcupada: 0
        };

        for (let i = 0; i < pecasRestantes.length; i++) {
            const peca = pecasRestantes[i];
            let alocado = false;

            // Tentar alocar em algum espaço livre
            for (let j = 0; j < chapa.espacos.length; j++) {
                const espaco = chapa.espacos[j];

                // Verificar se cabe sem rotacionar
                if (peca.largura <= espaco.largura && peca.altura <= espaco.altura) {
                    alocarPeca(chapa, peca, espaco, j, false, corte);
                    pecasRestantes.splice(i, 1);
                    i--;
                    alocado = true;
                    break;
                }
                // Verificar se cabe rotacionado
                else if (peca.altura <= espaco.largura && peca.largura <= espaco.altura) {
                    alocarPeca(chapa, peca, espaco, j, true, corte);
                    pecasRestantes.splice(i, 1);
                    i--;
                    alocado = true;
                    break;
                }
            }

            if (alocado) {
                // Reordenar espaços por área
                chapa.espacos.sort((a, b) => (a.largura * a.altura) - (b.largura * b.altura));
            }
        }

        chapas.push(chapa);
    }

    // Calcular estatísticas
    const densidade = parseFloat(document.getElementById('material').value);
    const pesoTotal = chapas.reduce((total, chapa) => {
        return total + calcularPesoKg(chapa.largura, chapa.altura, espessura, densidade);
    }, 0);

    const aproveitamentoMedio = chapas.reduce((total, chapa) => {
        return total + (chapa.areaOcupada / (chapa.largura * chapa.altura) * 100);
    }, 0) / chapas.length;

    // Atualizar resultados
    resultados = {
        chapas,
        totalChapas: chapas.length,
        totalPecas: pecasParaCorte.length,
        pesoTotal,
        aproveitamentoMedio
    };

    // Ocultar loading e mostrar resultados
    document.getElementById('loading').style.display = 'none';
    document.getElementById('resultados').style.display = 'block';

    // Atualizar estatísticas
    document.getElementById('chapasNecessarias').textContent = resultados.totalChapas;
    document.getElementById('aproveitamentoMedio').textContent = resultados.aproveitamentoMedio.toFixed(1) + '%';
    document.getElementById('pesoTotal').textContent = resultados.pesoTotal.toFixed(2) + ' kg';
    document.getElementById('pecasCortadas').textContent = resultados.totalPecas;

    // Renderizar gráfico
    requestAnimationFrame(() => {
        renderizarGrafico();
        if (chartInstance) {
            chartInstance.resize();
        }
    });

    // Renderizar chapas
    renderizarChapas();

    mostrarSucesso('Otimização calculada com sucesso!');
}

function alocarPeca(chapa, peca, espaco, indiceEspaco, rotacionar, corte) {
    const larguraPeca = rotacionar ? peca.altura : peca.largura;
    const alturaPeca = rotacionar ? peca.largura : peca.altura;

    // Adicionar peça à chapa
    const pecaAlocada = {
        ...peca,
        x: espaco.x,
        y: espaco.y,
        largura: larguraPeca,
        altura: alturaPeca,
        rotacionada: rotacionar
    };

    chapa.pecas.push(pecaAlocada);
    chapa.areaOcupada += larguraPeca * alturaPeca;

    // Remover espaço usado
    chapa.espacos.splice(indiceEspaco, 1);

    // Criar novos espaços (à direita e acima)
    const espacoDireita = {
        x: espaco.x + larguraPeca + corte,
        y: espaco.y,
        largura: espaco.largura - larguraPeca - corte,
        altura: alturaPeca
    };

    const espacoAcima = {
        x: espaco.x,
        y: espaco.y + alturaPeca + corte,
        largura: espaco.largura,
        altura: espaco.altura - alturaPeca - corte
    };

    // Adicionar apenas espaços válidos
    if (espacoDireita.largura > 0 && espacoDireita.altura > 0) {
        chapa.espacos.push(espacoDireita);
    }

    if (espacoAcima.largura > 0 && espacoAcima.altura > 0) {
        chapa.espacos.push(espacoAcima);
    }
}

function calcularPesoKg(larguraCm, alturaCm, espessuraMm, densidade) {
    return (larguraCm * alturaCm * (espessuraMm / 10.0) * densidade) / 1000.0;
}

function renderizarGrafico() {
    if (!resultados || !resultados.chapas || resultados.chapas.length === 0) {
        return;
    }

    const canvas = document.getElementById('chartCanvas');
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Preparar dados
    const labels = resultados.chapas.map((chapa, index) => `Chapa ${index + 1}`);
    const aproveitamentos = resultados.chapas.map(chapa => 
        (chapa.areaOcupada / (chapa.largura * chapa.altura) * 100)
    );
    const pecasPorChapa = resultados.chapas.map(chapa => chapa.pecas.length);

    // Determinar os máximos para escalas
    const maxAproveitamento = Math.max(...aproveitamentos);
    const maxPecas = Math.max(...pecasPorChapa);
    
    // Ajustar escala do eixo direito para números inteiros
    const escalaPecasMax = Math.ceil(maxPecas * 1.1); // 10% acima do máximo
    const escalaAproveitamentoMax = Math.min(100, Math.ceil(maxAproveitamento * 1.1)); // Máximo 100%

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Aproveitamento (%)',
                    data: aproveitamentos,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y',
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Nº de Peças',
                    data: pecasPorChapa,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        drawBorder: true
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Aproveitamento (%)',
                        color: 'rgba(54, 162, 235, 1)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: escalaAproveitamentoMax,
                    ticks: {
                        color: 'rgba(54, 162, 235, 1)',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value + '%';
                        },
                        stepSize: 10
                    },
                    grid: {
                        color: 'rgba(54, 162, 235, 0.1)',
                        drawBorder: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Número de Peças',
                        color: 'rgba(255, 99, 132, 1)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: escalaPecasMax,
                    ticks: {
                        color: 'rgba(255, 99, 132, 1)',
                        font: {
                            size: 12
                        },
                        stepSize: Math.max(1, Math.floor(escalaPecasMax / 10))
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(255, 99, 132, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 13
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 13
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                if (context.datasetIndex === 0) {
                                    return label + ': ' + context.parsed.y.toFixed(1) + '%';
                                } else {
                                    return label + ': ' + context.parsed.y;
                                }
                            }
                            return '';
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function renderizarChapas() {
    if (!resultados || !resultados.chapas || resultados.chapas.length === 0) {
        return;
    }

    const container = document.getElementById('sheetContainer');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    resultados.chapas.forEach((chapa, index) => {
        const sheet = document.createElement('div');
        sheet.className = 'sheet';

        const header = document.createElement('div');
        header.className = 'sheet-header';

        const titulo = document.createElement('div');
        titulo.className = 'sheet-title';
        titulo.textContent = `Chapa ${index + 1}`;

        const stats = document.createElement('div');
        stats.className = 'sheet-stats';
        const aproveitamento = (chapa.areaOcupada / (chapa.largura * chapa.altura) * 100).toFixed(1);
        stats.textContent = `${chapa.pecas.length} peÃ§as | ${aproveitamento}%`;

        header.appendChild(titulo);
        header.appendChild(stats);

        const canvasDiv = document.createElement('div');
        canvasDiv.className = 'sheet-canvas';
        canvasDiv.id = `sheetCanvas${index}`;

        sheet.appendChild(header);
        sheet.appendChild(canvasDiv);
        container.appendChild(sheet);

        const ratio = chapa.largura / chapa.altura;
        if (Number.isFinite(ratio) && ratio > 0) {
            canvasDiv.style.setProperty('--sheet-ratio', `${ratio} / 1`);
        }

        requestAnimationFrame(() => {
            renderizarPecasNaChapa(chapa, index);
        });
    });
}

function renderizarPecasNaChapa(chapa, index) {
    const canvasDiv = document.getElementById(`sheetCanvas${index}`);
    if (!canvasDiv) {
        return;
    }

    const larguraCanvas = canvasDiv.clientWidth;
    const alturaCanvas = canvasDiv.clientHeight;
    if (larguraCanvas === 0 || alturaCanvas === 0) {
        requestAnimationFrame(() => renderizarPecasNaChapa(chapa, index));
        return;
    }

    const escala = Math.min(
        larguraCanvas / chapa.largura,
        alturaCanvas / chapa.altura
    ) * 0.9; // 90% para dar margem

    // Limpar canvas
    canvasDiv.innerHTML = '';

    const chapaLarguraPx = chapa.largura * escala;
    const chapaAlturaPx = chapa.altura * escala;
    const offsetX = Math.max(0, (larguraCanvas - chapaLarguraPx) / 2);
    const offsetY = Math.max(0, (alturaCanvas - chapaAlturaPx) / 2);

    // Adicionar fundo da chapa
    const chapaDiv = document.createElement('div');
    chapaDiv.style.position = 'absolute';
    chapaDiv.style.left = `${offsetX}px`;
    chapaDiv.style.top = `${offsetY}px`;
    chapaDiv.style.width = `${chapaLarguraPx}px`;
    chapaDiv.style.height = `${chapaAlturaPx}px`;
    chapaDiv.style.backgroundColor = '#f8f9fa';
    chapaDiv.style.border = '1px solid #bdc3c7';
    chapaDiv.style.borderRadius = '5px';
    chapaDiv.style.overflow = 'hidden';
    canvasDiv.appendChild(chapaDiv);

    // Adicionar cada peça
    chapa.pecas.forEach((peca, i) => {
        const pecaDiv = document.createElement('div');
        pecaDiv.className = 'piece';
        pecaDiv.style.left = (peca.x * escala) + 'px';
        pecaDiv.style.top = (peca.y * escala) + 'px';
        pecaDiv.style.width = (peca.largura * escala) + 'px';
        pecaDiv.style.height = (peca.altura * escala) + 'px';
        pecaDiv.style.backgroundColor = peca.cor;
        
        const mostrarRotacionadas = document.getElementById('toggleRotacionar').checked;
        const rotacionada = mostrarRotacionadas && peca.rotacionada;
        const texto = rotacionada ? 
            `#${peca.id}<br>${peca.largura.toFixed(1)}x${peca.altura.toFixed(1)}<br>(R)` :
            `#${peca.id}<br>${peca.largura.toFixed(1)}x${peca.altura.toFixed(1)}`;
        
        pecaDiv.innerHTML = `<div class="piece-text">${texto}</div>`;
        chapaDiv.appendChild(pecaDiv);
    });
}

function exportarResultados() {
    if (!resultados) {
        mostrarErro('Calcule a otimização primeiro antes de exportar.');
        return;
    }

    // Criar conteúdo para exportação
    const larguraChapa = document.getElementById('larguraChapa').value;
    const alturaChapa = document.getElementById('alturaChapa').value;
    const material = document.getElementById('material').options[document.getElementById('material').selectedIndex].text;
    const espessura = document.getElementById('espessura').value;
    
    let conteudo = `RELATÓRIO DE NESTING - ${new Date().toLocaleDateString()}\n\n`;
    conteudo += `Configuração:\n`;
    conteudo += `- Chapa: ${larguraChapa} x ${alturaChapa} cm\n`;
    conteudo += `- Material: ${material}\n`;
    conteudo += `- Espessura: ${espessura} mm\n\n`;
    conteudo += `Resultados:\n`;
    conteudo += `- Chapas necessárias: ${resultados.totalChapas}\n`;
    conteudo += `- Peças cortadas: ${resultados.totalPecas}\n`;
    conteudo += `- Aproveitamento médio: ${resultados.aproveitamentoMedio.toFixed(1)}%\n`;
    conteudo += `- Peso total: ${resultados.pesoTotal.toFixed(2)} kg\n\n`;
    conteudo += `Detalhes por chapa:\n`;
    
    resultados.chapas.forEach((chapa, index) => {
        const aproveitamento = (chapa.areaOcupada / (chapa.largura * chapa.altura) * 100).toFixed(1);
        conteudo += `Chapa ${index + 1}: ${chapa.pecas.length} peças | Aproveitamento: ${aproveitamento}%\n`;
    });

    // Criar blob e link para download
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nesting_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    mostrarSucesso('Relatório exportado com sucesso!');
}
