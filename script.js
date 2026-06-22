/* =========================================
   1. CONFIGURAÇÃO DO CANVAS E DO MOUSE
   ========================================= */

// Captura o elemento <canvas> do HTML e define o contexto como '2d' (para desenhar formas planas)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas para ocupar 100% da largura e altura da janela do navegador
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = []; // Lista vazia que vai guardar todas as partículas (pontinhos) criadas

// Objeto que registra a posição atual do mouse e o tamanho do seu "campo de força"
let mouse = {
    x: null,
    y: null,
    radius: 100 // Raio de influência: partículas a menos de 100px do mouse/dedo serão empurradas
};

// Fica "escutando" o movimento do mouse na tela e atualiza as coordenadas x e y
window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Se o mouse sair da janela do site, anula a posição para que as partículas parem de fugir
window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

// --- INTERATIVIDADE PARA TELAS DE TOQUE (CELULARES) ---

// Quando o dedo toca na tela
window.addEventListener('touchstart', function(event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
});

// Quando o dedo arrasta pela tela
window.addEventListener('touchmove', function(event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
});

// Quando o dedo sai da tela
window.addEventListener('touchend', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

// ------------------------------------------------------

// Se o usuário redimensionar a janela (ex: virar o celular ou maximizar), reajusta o canvas e recria as partículas
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

/* =========================================
   2. A CLASSE PARTICLE (O MOLDE DOS PONTINHOS)
   ========================================= */

class Particle {
    constructor(x, y, size) {
        this.x = x; 
        this.y = y; 
        this.size = size; 
        
        // NOVO: Em vez de um ponto fixo (base), damos uma velocidade contínua
        // Math.random() * 1.5 - 0.75 gera velocidades positivas (direita/baixo) e negativas (esquerda/cima)
        this.vx = (Math.random() * 1.5) - 0.75; // Velocidade horizontal
        this.vy = (Math.random() * 1.5) - 0.75; // Velocidade vertical
        
        this.density = (Math.random() * 30) + 1; 
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // --- 1. MOVIMENTO AUTOMÁTICO (Vida própria) ---
        this.x += this.vx;
        this.y += this.vy;

        // --- 2. COLISÃO COM AS BORDAS (Bate e volta) ---
        // Se a bolinha encostar na parede direita ou esquerda, inverte a velocidade X
        if (this.x < 0 || this.x > canvas.width) {
            this.vx = -this.vx;
        }
        // Se a bolinha encostar no teto ou no chão, inverte a velocidade Y
        if (this.y < 0 || this.y > canvas.height) {
            this.vy = -this.vy;
        }

        // --- 3. INTERAÇÃO COM O MOUSE/DEDO (Repulsão) ---
        // Só tenta empurrar se o mouse/dedo estiver ativamente na tela (x e y não são nulos)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy); 
            
            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance; 
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                // Empurra a bolinha na direção oposta
                this.x -= directionX;
                this.y -= directionY;
            }
        }

        this.draw(); 
    }
}

/* =========================================
   3. INICIALIZAÇÃO E LOOP DE ANIMAÇÃO
   ========================================= */

// Função que cria o exército inicial de partículas
function init() {
    particlesArray = [];
    // Calcula a quantidade de pontos com base na área total da tela (telas maiores terão mais pontos)
    let numberOfParticles = (canvas.width * canvas.height) / 7000; 
    
    // Um laço de repetição (for loop) que cria cada partícula individualmente
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 0.5; // Tamanho aleatório entre 0.5px e 2.5px
        let x = Math.random() * innerWidth; // Posição horizontal inicial aleatória
        let y = Math.random() * innerHeight; // Posição vertical inicial aleatória
        particlesArray.push(new Particle(x, y, size)); // Adiciona a nova partícula na lista
    }
}

// O motor contínuo que faz as coisas se mexerem na tela (60 frames por segundo)
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Apaga a tela inteira (o quadro anterior)
    
    // Atualiza e desenha cada partícula na sua nova posição
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    
    requestAnimationFrame(animate); // Fica chamando essa mesma função infinitamente em loop
}

// Executa a inicialização e dá a partida na animação
init();
animate();

/* =========================================
   4. LÓGICA DO EFEITO TYPEWRITER
   ========================================= */

// Array (lista) contendo os textos que queremos alternar
const textsToType = ["Abu Bokkor", "Bokkor"];
const typewriterElement = document.getElementById('typewriter');

// Variáveis de controle de estado
let textIndex = 0; // Aponta para qual texto da lista será usado (0 = "Abu Bokkor", 1 = "Bokkor")
let charIndex = 0; // Conta quantas letras já foram digitadas da palavra atual
let isDeleting = false; // "Interruptor" que avisa se a máquina está apagando ou escrevendo
let useCodingFont = false; // "Interruptor" que avisa qual fonte usar no CSS

// A função principal que faz a mágica de escrever
function typeEffect() {
    // 1. Define qual fonte (classe CSS) usar na rodada atual
    if (useCodingFont) {
        typewriterElement.className = 'font-coding';
    } else {
        typewriterElement.className = 'font-primary';
    }

    // Pega a palavra certa da lista baseada no índice atual
    const currentText = textsToType[textIndex];

    // 2. Lógica de digitar e apagar
    if (!isDeleting && charIndex <= currentText.length) {
        // Modo: ESCREVENDO
        // Pega um pedaço do texto que vai da letra zero até o número atual de letras permitidas
        typewriterElement.textContent = currentText.substring(0, charIndex);
        charIndex++; // Autoriza a próxima letra
        setTimeout(typeEffect, 150); // Aguarda 150 milissegundos e chama a função de novo
        
    } else if (isDeleting && charIndex >= 0) {
        // Modo: APAGANDO
        typewriterElement.textContent = currentText.substring(0, charIndex);
        charIndex--; // Remove uma letra da autorização
        setTimeout(typeEffect, 100); // Velocidade mais rápida (100ms) para apagar
        
    } else {
        // 3. Controle de tempo e troca de estado (quando termina de escrever ou de apagar)
        if (!isDeleting) {
            // Terminou de escrever a palavra inteira: muda o interruptor e espera 5 segundos
            isDeleting = true;
            setTimeout(typeEffect, 5000); // 5000ms = 5 segundos de pausa com a palavra completa
        } else {
            // Terminou de apagar tudo: inverte a fonte, troca a palavra e recomeça a escrever
            isDeleting = false;
            useCodingFont = !useCodingFont; // Inverte o valor (se era false, vira true)
            
            // Alterna entre 0 e 1 para pegar a próxima palavra da lista usando o resto da divisão (%)
            textIndex = (textIndex + 1) % textsToType.length; 
            
            setTimeout(typeEffect, 500); // Pequena pausa de respiro antes de recomeçar
        }
    }
}

// Quando o navegador terminar de ler e montar todo o HTML, ele dispara o efeito typewriter
document.addEventListener('DOMContentLoaded', () => {
    typeEffect();
});