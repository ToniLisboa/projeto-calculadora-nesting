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
            <td>
                <div class="item-color" style="background-color: ${peca.cor};"></div>
                ${index + 1}
            </td>
            <td>${peca.largura.toFixed(1)}</td>
            <td>${peca.altura.toFixed(1)}</td>
            <td>${peca.quantidade}</td>
            <td>
                <button onclick="removerPeca(${index})" class="btn" style="padding: 5px 10px; background-color: #e74c3c; color: white; font-size: 0.9rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
