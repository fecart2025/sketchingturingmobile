# 🎨 Sketching Turing

## 📖 Descrição

**Sketching Turing** é um jogo educativo interativo onde os usuários desenham objetos históricos relacionados a diferentes temas, e uma IA simula a análise e tentativa de adivinhação dos desenhos. O jogo combina criatividade artística com aprendizado histórico, oferecendo uma experiência única de desenho digital.

## 🎯 Objetivo do Jogo

O objetivo é desenhar objetos relacionados aos temas históricos de forma clara e reconhecível, permitindo que a IA "adivinhe" corretamente o que foi desenhado. Os jogadores ganham pontos baseados na precisão do desenho e no tempo utilizado.

## 🚀 Funcionalidades Principais

### ✨ Sistema de Temas
- **Pré-História**: Fogo, Caverna, Mamute, Lança, Pintura Rupestre
- **Guerras Mundiais**: Tanque, Avião, Soldado, Trincheira, Submarino
- **Antiguidade**: Pirâmide, Coliseu, Espada, Carruagem, Escultura

### 🎮 Mecânicas de Jogo
- **3 Rodadas por partida** com 60 segundos cada
- **Sistema de pontuação inteligente** baseado no tempo e acertos
- **Feedback do usuário** sobre a precisão da IA
- **Ranking persistente** salvo no navegador
- **Interface responsiva** para diferentes dispositivos

### 🖌️ Ferramentas de Desenho
- **Canvas interativo** com p5.js
- **Botão Limpar** para recomeçar o desenho
- **Botão Desfazer** para remover o último traço
- **Suporte a mouse e touch** para dispositivos móveis

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da aplicação
- **CSS3** - Estilização e responsividade
- **JavaScript (ES6+)** - Lógica do jogo
- **p5.js** - Biblioteca para desenho digital
- **Tailwind CSS** - Framework CSS utilitário
- **Boxicons** - Ícones da interface

## 📁 Estrutura do Projeto

```
agosto/
├── index.html          # Página principal do jogo
├── script.js           # Lógica JavaScript do jogo
├── style.css           # Estilos CSS personalizados
├── fundo.jpg           # Imagem de fundo
├── logo.png            # Logo principal
├── logo2.png           # Logo secundário
├── sketching.png       # Imagem ilustrativa
└── README.md           # Este arquivo de documentação
```

## 🎮 Como Jogar

### 1. **Início**
   - Digite seu nome na tela inicial
   - Escolha um dos três temas disponíveis

### 2. **Jogabilidade**
   - Desenhe objetos relacionados ao tema escolhido
   - Use as sugestões como referência
   - Complete o desenho antes do tempo acabar

### 3. **Sistema de Pontuação**
   - **Pontos por tempo**: Quanto mais rápido, mais pontos
   - **Bônus por acerto**: +20 pontos quando a IA acerta
   - **Bônus de conclusão**: +50 pontos por completar todas as rodadas

### 4. **Feedback da IA**
   - A IA analisa seu desenho e faz um palpite
   - Confirme se ela acertou (✔️) ou errou (❌)
   - Sua resposta afeta a pontuação final

## 🔧 Instalação e Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet (para carregar CDNs)

### Execução
1. Clone ou baixe o projeto
2. Abra o arquivo `index.html` em seu navegador
3. Comece a jogar imediatamente!

### Desenvolvimento
Para modificar o jogo:
1. Edite `script.js` para alterar a lógica
2. Modifique `style.css` para personalizar a aparência
3. Atualize `index.html` para mudar a estrutura

## 🎨 Personalização

### Adicionar Novos Temas
```javascript
// Em script.js, adicione ao objeto themes:
"novo-tema": {
    title: "Nome do Tema",
    suggestions: ["Item1", "Item2", "Item3", "Item4", "Item5"]
}
```

### Modificar Estilos
- Edite `style.css` para personalizar cores, fontes e animações
- Use as classes Tailwind CSS para ajustes rápidos
- Modifique as variáveis CSS para mudanças globais

## 🐛 Problemas Corrigidos

### ✅ Sobreposição de Telas
- Implementado sistema de gerenciamento de instâncias p5.js
- Função `showPage()` para controle de visibilidade
- Limpeza adequada de recursos ao trocar de tela

### ✅ Sistema de Pontuação
- Pontuação baseada no tempo restante
- Bônus por acertos confirmados pelo usuário
- Sistema de rodadas múltiplas para pontuação acumulativa

### ✅ Controle da IA
- IA só analisa após o usuário terminar o desenho
- Feedback obrigatório do usuário antes de continuar
- Sistema de estados para controle do fluxo do jogo

### ✅ Persistência de Dados
- Ranking salvo no localStorage
- Nomes de usuários preservados entre sessões
- Sistema de ranking top 10

## 🚀 Melhorias Futuras

- [ ] **Sistema de níveis** com dificuldade progressiva
- [ ] **Modo multiplayer** para competição entre jogadores
- [ ] **Mais temas** e categorias de desenho
- [ ] **Sistema de conquistas** e badges
- [ ] **Exportação de desenhos** para redes sociais
- [ ] **IA real** com machine learning para análise de desenhos
- [ ] **Modo offline** com PWA
- [ ] **Sons e música** para imersão

## 📱 Responsividade

O jogo é totalmente responsivo e funciona em:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (até 767px)

## 🤝 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste em diferentes dispositivos
5. Envie um pull request

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para proporcionar uma experiência educativa e divertida de desenho digital.

---

**Sketching Turing** - Onde a criatividade encontra a história! 🎨✨
