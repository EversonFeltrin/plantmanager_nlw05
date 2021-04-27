// TypeScript n consegue achar a imagem e adicionando na raiz, sobrescreve, quando existit .png ele trata
declare module '*.png' {
    const content = any;
    export default content;
}