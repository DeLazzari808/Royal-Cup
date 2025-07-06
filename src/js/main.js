import '../css/style.css';
import { ref, onValue } from "firebase/database";
import { database } from './firebase-config.js';
import { logoMap } from './team-logos.js';

// --- FUNÇÃO PARA BUSCAR DADOS (sem alteração) ---
async function getAllData() {
    const dataRef = ref(database);
    return new Promise((resolve) => {
        onValue(dataRef, (snapshot) => {
            snapshot.exists() ? resolve(snapshot.val()) : resolve(null);
        }, { onlyOnce: true });
    });
}

// --- FUNÇÃO DE RENDERIZAÇÃO DE CARD DE JOGO (NOVO DESIGN) ---
function renderMatchCard(match, teamsData) {
    if (!match) return '';
    const teamA = teamsData[match.timeA] || { nome: match.timeA || 'A definir' };
    const teamB = teamsData[match.timeB] || { nome: match.timeB || 'A definir' };
    const logoA = logoMap[match.timeA] || '/img/default-logo.png';
    const logoB = logoMap[match.timeB] || '/img/default-logo.png';
    const scoreA = match.placarA ?? '-';
    const scoreB = match.placarB ?? '-';
    const isWinnerA = scoreA !== '-' && scoreB !== '-' && scoreA > scoreB;
    const isWinnerB = scoreA !== '-' && scoreB !== '-' && scoreB > scoreA;

    return `
        <div class="match-card">
            <div class="team-info ${isWinnerA ? 'winner' : ''}">
                <img src="${logoA}" alt="${teamA.nome}" />
                <span class="team-name">${teamA.nome}</span>
            </div>
            <span class="score ${isWinnerA ? 'winner' : ''}">${scoreA}</span>
            <span class="match-separator">x</span>
            <span class="score ${isWinnerB ? 'winner' : ''}">${scoreB}</span>
            <div class="team-info justify-end ${isWinnerB ? 'winner' : ''}">
                <span class="team-name">${teamB.nome}</span>
                <img src="${logoB}" alt="${teamB.nome}" />
            </div>
        </div>`;
}

// --- FUNÇÕES DE RENDERIZAÇÃO DE CADA SEÇÃO ---

function loadTeamsCarousel(teamsData) {
    const container = document.getElementById('team-carousel');
    if (!container || !teamsData) return;
    const teamIds = Object.keys(teamsData);
    container.innerHTML = [...teamIds, ...teamIds].map(id => {
        const team = teamsData[id];
        return `<a href="/time.html?id=${id}" class="flex-shrink-0 mx-4 group w-24 text-center"><img src="${logoMap[id]}" alt="${team.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 group-hover:border-primary-orange transition-all duration-300 mx-auto"><span class="mt-2 block text-xs sm:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-300 truncate">${team.nome}</span></a>`;
    }).join('');
    container.classList.add('animate-marquee');
}

function loadLastResults(matchesData, teamsData) {
    const container = document.getElementById('results-container');
    const seeMoreContainer = document.getElementById('see-more-container');
    if (!container || !seeMoreContainer || !matchesData) return;
    const finishedMatches = Object.values(matchesData).filter(m => m.status === 'Finalizado').sort((a,b) => new Date(b.data) - new Date(a.data));
    if (finishedMatches.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-400">Nenhum resultado para exibir.</p>';
        return;
    }
    const initialCount = 4;
    container.innerHTML = finishedMatches.slice(0, initialCount).map(p => renderMatchCard(p, teamsData)).join('');
    if (finishedMatches.length > initialCount) {
        seeMoreContainer.innerHTML = `<button id="see-more-btn" class="bg-primary-orange/80 text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-orange transition duration-300">Ver mais resultados</button>`;
        document.getElementById('see-more-btn').addEventListener('click', () => {
            container.innerHTML = finishedMatches.map(p => renderMatchCard(p, teamsData)).join('');
            seeMoreContainer.innerHTML = '';
        });
    }
}

function displayGroupTables(matchesData, teamsData) {
    const container = document.getElementById('group-stage-container');
    if (!container || !matchesData || !teamsData) return;

    const grupos = { A: ['hip', 'asa', 'amb', 'ast', 'dem', 'imp', 'tnk', 'psg', 'kwr', 'fdq'], B: ['cfc', 'hor', 'maf', 'futpro', 'naj', 'vmt', 'rep', 'ver', 'mag', 'cmg'] };
    Object.values(teamsData).forEach(t => { t.pontos = 0; t.jogos = 0; t.golsPro = 0; t.golsContra = 0; });
    Object.values(matchesData).forEach(p => {
        if (p.fase !== 'grupos') return;
        const timeA = teamsData[p.timeA], timeB = teamsData[p.timeB];
        if (!timeA || !timeB) return;
        timeA.jogos++; timeB.jogos++;
        timeA.golsPro += p.placarA; timeA.golsContra += p.placarB;
        timeB.golsPro += p.placarB; timeB.golsContra += p.placarA;
        if (p.shootout) {
            const winner = p.shootout.placarA > p.shootout.placarB ? timeA : timeB;
            winner.pontos += 2; (winner === timeA ? timeB : timeA).pontos += 1;
        } else if (p.placarA > p.placarB) {
            timeA.pontos += 3;
        } else if (p.placarB > p.placarA) {
            timeB.pontos += 3;
        }
    });
    
    const sortTeams = (a, b) => (b.pontos - a.pontos) || ((b.golsPro - b.golsContra) - (a.golsPro - a.golsContra)) || (b.golsPro - a.golsPro);
    const allTeamsWithId = Object.entries(teamsData).map(([id, data]) => ({ ...data, id }));
    const classGrupoA = allTeamsWithId.filter(t => grupos.A.includes(t.id)).sort(sortTeams);
    const classGrupoB = allTeamsWithId.filter(t => grupos.B.includes(t.id)).sort(sortTeams);

    const renderTable = (tbody, teams) => {
        tbody.innerHTML = teams.map((team, index) => `<tr class="border-b border-neutral-700/50"><td class="p-3 font-semibold">${index + 1}</td><td class="p-3"><a href="/time.html?id=${team.id}" class="flex items-center gap-3"><img src="${logoMap[team.id]}" class="w-6 h-6 rounded-full object-cover"><span class="font-semibold">${team.nome}</span></a></td><td class="p-3 text-center font-bold">${team.pontos}</td><td class="p-3 text-center">${team.jogos}</td><td class="p-3 text-center font-semibold">${(team.golsPro - team.golsContra) > 0 ? '+' : ''}${team.golsPro - team.golsContra}</td></tr>`).join('');
    };

    container.innerHTML = `
        <div class="card"><h3 class="text-xl font-bold text-center text-white p-4 bg-neutral-900/50 rounded-t-lg">Grupo A</h3><div class="p-2"><table class="w-full text-sm"><thead class="text-xs text-neutral-400 uppercase"><tr><th class="p-3">#</th><th class="p-3">Time</th><th class="p-3 text-center">P</th><th class="p-3 text-center">J</th><th class="p-3 text-center">SG</th></tr></thead><tbody id="standings-body-a"></tbody></table></div></div>
        <div class="card"><h3 class="text-xl font-bold text-center text-white p-4 bg-neutral-900/50 rounded-t-lg">Grupo B</h3><div class="p-2"><table class="w-full text-sm"><thead class="text-xs text-neutral-400 uppercase"><tr><th class="p-3">#</th><th class="p-3">Time</th><th class="p-3 text-center">P</th><th class="p-3 text-center">J</th><th class="p-3 text-center">SG</th></tr></thead><tbody id="standings-body-b"></tbody></table></div></div>
    `;
    renderTable(document.getElementById('standings-body-a'), classGrupoA);
    renderTable(document.getElementById('standings-body-b'), classGrupoB);
}

function displayPlayoffs(teamsData) {
    const playInContainer = document.getElementById('play-in-container');
    const bracketContainer = document.getElementById('bracket-container');
    if (!playInContainer || !bracketContainer || !teamsData) return;

    // Definição dos Confrontos
    const playInMatch = { timeA: 'ast', timeB: 'g29' };
    const oitavas = [ { timeA: 'kwr', timeB: 'mag' }, { timeA: 'rep', timeB: 'amb' }, { timeA: 'futpro', timeB: 'imp' }, { timeA: 'dem', timeB: 'Vencedor Play-In' }, { timeA: 'Classificado Repescagem', timeB: 'cmg' }, { timeA: 'tnk', timeB: 'ver' }, { timeA: 'hip', timeB: 'naj' }, { timeA: 'asa', timeB: 'hor' } ];
    const quartas = Array(4).fill(null);
    const semi = Array(2).fill(null);
    const final = [null];

    const renderRound = (matches, title) => {
        if (!matches || matches.length === 0) return '';
        return `
        <div class="round">
            <h3 class="round-title">${title}</h3>
            ${matches.map(m => `<div class="match-up"><div class="match-content">${renderMatchCard(m, teamsData)}</div></div>`).join('')}
        </div>`;
    };

    playInContainer.innerHTML = `<h3 class="section-title text-2xl text-primary-orange">Play-In</h3><div class="max-w-md mx-auto">${renderMatchCard(playInMatch, teamsData)}</div>`;
    bracketContainer.innerHTML = `
        ${renderRound(oitavas, 'Oitavas de Final')}
        ${renderRound(quartas, 'Quartas de Final')}
        ${renderRound(semi, 'Semifinais')}
        ${renderRound(final, 'Final')}
        <div class="round champion-column"><h3 class="round-title">Campeão</h3><div class="flex items-center justify-center h-full"><i class="ph-fill ph-trophy text-8xl text-yellow-400"></i></div></div>
    `;
}

// --- PONTO DE ENTRADA DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
    const mainContent = document.querySelector('main');
    if(mainContent) mainContent.style.visibility = 'hidden';
    const allData = await getAllData();
    if (allData && allData.times && allData.partidas) {
        loadTeamsCarousel(allData.times);
        loadLastResults(allData.partidas, allData.times);
        displayGroupTables(allData.partidas, allData.times);
        displayPlayoffs(allData.times);
    } else {
        document.body.innerHTML = '<p class="text-center text-red-500 font-bold p-8">Erro: Não foi possível carregar os dados do campeonato.</p>';
    }
    if(mainContent) mainContent.style.visibility = 'visible';
    const btn = document.querySelector("button.mobile-menu-button");
    const menu = document.querySelector(".mobile-menu");
    if (btn && menu) btn.addEventListener("click", () => menu.classList.toggle("hidden"));
});