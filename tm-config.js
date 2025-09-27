// Configuração dos modelos do Teachable Machine
// Substitua os valores abaixo pelos URLs dos seus modelos após exportar do Teachable Machine.
// Use o link base de cada projeto e acrescente "model.json" e "metadata.json".
// Exemplo: "https://teachablemachine.withgoogle.com/models/SEU_ID/model.json"

window.TM_CONFIG = {
    modelUrls: {
        "pre-history": {
            model: "https://teachablemachine.withgoogle.com/models/XpHdnrolV/model.json",
            metadata: "https://teachablemachine.withgoogle.com/models/XpHdnrolV/metadata.json"
        },
        "world-wars": {
            model: "https://teachablemachine.withgoogle.com/models/HwMqIYLgK/model.json",
            metadata: "https://teachablemachine.withgoogle.com/models/HwMqIYLgK/metadata.json"
        },
        "antiquity": {
            model: "https://teachablemachine.withgoogle.com/models/UHkxjIdbm/model.json",
            metadata: "https://teachablemachine.withgoogle.com/models/UHkxjIdbm/metadata.json"
        }
    },
    // Opcional: mapeie os nomes de classes do seu modelo para os termos mostrados ao usuário
    // Caso os rótulos das classes do Teachable Machine não batam exatamente com as sugestões.
    // Ex.: "fire" -> "Fogo"
    labelMap: {
        // "fire": "Fogo"
    }
};



