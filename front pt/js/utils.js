// =========================================================================
// UTIL.JS - RECURSOS DE SUPORTE E MAPEAMENTO FRONT -> JAVA
// =========================================================================

// Mapeamento entre a sigla da NR e o sufixo do atributo na Entidade Funcionario.java
const mapaCamposJava = {
    "NR01": "Nr01",
    "NR10": "Nr10",
    "NR10SEP": "Nr10Sep",
    "NR11": "Nr11",
    "NR12": "Nr12",
    "NR13": "Nr13",
    "NR18": "Nr18",
    "NR20": "Nr20",
    "NR33": "Nr33",
    "NR34": "Nr34",
    "NR35": "Nr35",
    "BRIGADA": "Brigada"
};

/**
 * Mapeia a sigla da NR para o formato do atributo na classe Funcionario.java
 * Exemplo: "NR10SEP" -> "Nr10Sep" (usado para montar "realizacaoNr10Sep")
 */
function obterNomeCampoJava(nr) {
    return mapaCamposJava[nr] || null;
}

/**
 * Calcula dinamicamente a data de vencimento a partir da realização (caso utilize na interface)
 */
function calcularVencimentoDireto(idRealizacao, idValidade, meses) {
    const inputR = document.getElementById(idRealizacao);
    const inputV = document.getElementById(idValidade);
    if (!inputR || !inputR.value || !inputV) return;

    const d = new Date(inputR.value + 'T00:00:00');
    d.setMonth(d.getMonth() + parseInt(meses));
    inputV.value = d.toISOString().split('T')[0];
}