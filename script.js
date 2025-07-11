const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const AIResponse = document.getElementById('AIResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const askAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`  
    const ask = `
     ## Especialidade
    Você é um especialista assistente de meta para o jogo Dota 2

     ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas sobre as posições/roles ${game}

     ## Regra
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se o meta do jogo é muito novo e você ainda não tem a certeza das melhores builds, estratégias e/ou gameplay de cada ${game}, ser honesta e não dar respostas com base em achismo.
    - Se a pergunta não estiver relacionada ao jogo, responda 'Essa pergunta não está relaciona ao jogo'.
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza que exista no patch atual.

     ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda em markdown. 
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário perguntou.

     #Exemplo de resposta
     Pergunta do usuário: Melhor build [herói] para posição ${game}
     Resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui em ordem de compra e minutagem de jogo\n\n**Skills**\n\n colocar a sequencia de skills a serem upadas para cada possível situação de jogo ou counter-player que possa estar no time contra.\n\n

     ---
     Aqui está a pergunta do usuário: ${question}
    `
    const contents = [{
        role: "user",
        parts: [{
            text: ask
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
           'Content-Type':'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })
    const data = await response.json()
    console.log({ data })
    return data.candidates[0].content.parts[0].text
}

const submitForm = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question =='') {
        alert('Please fill out all fields')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Asking AI...'
    askButton.classList.add('loading')

    try {
       const text = await askAI(question, game, apiKey)
        AIResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        AIResponse.classList.remove('hidden')

    } catch(error) {
        console.log('Error:', error)

    } finally {
        askButton.disabled = false
        askButton.textContent = "Ask AI"
        askButton.classList.remove('loading')
    }

}
form.addEventListener('submit', submitForm)
