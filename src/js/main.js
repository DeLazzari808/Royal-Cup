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

// --- FUNÇÃO DE RENDERIZAÇÃO DE CARD DE JOGO (REUTILIZÁVEL) ---
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
            <div class="match-team ${isWinnerA ? 'winner' : ''}">
                <div class="team-info"><img src="${logoA}" class="w-6 h-6 rounded-full object-cover"><span class="team-name">${teamA.nome}</span></div>
                <span class="score">${scoreA}</span>
            </div>
            <div class="match-separator">vs</div>
            <div class="match-team ${isWinnerB ? 'winner' : ''}">
                <div class="team-info"><span class="score">${scoreB}</span><img src="${logoB}" class="w-6 h-6 rounded-full object-cover"></div>
                <span class="team-name text-right">${teamB.nome}</span>
            </div>
        </div>
    `;
}

// --- FUNÇÕES DE RENDERIZAÇÃO PARA CADA SEÇÃO ---

function loadTeamsCarousel(teamsData) {
    const carouselContainer = document.getElementById('team-carousel');
    if (!carouselContainer || !teamsData) return;
    const teamIds = Object.keys(teamsData);
    const allTeamIds = [...teamIds, ...teamIds];
    carouselContainer.innerHTML = allTeamIds.map(teamId => {
        const team = teamsData[teamId];
        const logoSrc = logoMap[teamId];
        return team && logoSrc ? `<a href="/time.html?id=${teamId}" class="flex-shrink-0 mx-4 group w-24 text-center"><img src="${logoSrc}" alt="Logo do ${team.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 group-hover:border-primary-orange transition-all duration-300 mx-auto"><span class="mt-2 block text-xs sm:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-300 truncate">${team.nome}</span></a>` : '';
    }).join('');
    carouselContainer.classList.add('animate-marquee');
}

function loadLastResults(matchesData, teamsData) {
    const container = document.getElementById('results-container');
    if (!container || !matchesData || !teamsData) return;
    const finishedMatches = Object.values(matchesData).filter(m => m.status === 'Finalizado').sort((a,b) => new Date(b.data) - new Date(a.data)).slice(0, 4);
    if (finishedMatches.length > 0) {
        container.innerHTML = finishedMatches.map(p => renderMatchCard(p, teamsData)).join('');
    } else {
        container.innerHTML = '<p class="col-span-full text-center text-gray-400">Nenhum resultado finalizado ainda.</p>';
    }
}

function displayGroupTables(matchesData, teamsData) {
    const container = document.getElementById('group-stage-container');
    const tbodyA = document.getElementById('standings-body-a');
    const tbodyB = document.getElementById('standings-body-b');
    if (!container || !tbodyA || !tbodyB || !matchesData || !teamsData) return;

    const grupos = { A: ['hip', 'asa', 'amb', 'ast', 'dem', 'imp', 'tnk', 'psg', 'kwr', 'fdq'], B: ['cfc', 'hor', 'maf', 'futpro', 'naj', 'vmt', 'rep', 'ver', 'mag', 'cmg'] };
    Object.values(teamsData).forEach(t => { t.pontos = 0; t.jogos = 0; t.vitorias = 0; t.derrotas = 0; t.golsPro = 0; t.golsContra = 0; });

    Object.values(matchesData).forEach(p => {
        if (p.status !== 'Finalizado' || p.fase !== 'grupos') return;
        const timeA = teamsData[p.timeA], timeB = teamsData[p.timeB];
        if (!timeA || !timeB) return;
        timeA.jogos++; timeB.jogos++;
        timeA.golsPro += p.placarA; timeA.golsContra += p.placarB;
        timeB.golsPro += p.placarB; timeB.golsContra += p.placarA;
        if (p.shootout) {
            const winner = p.shootout.placarA > p.shootout.placarB ? timeA : timeB;
            const loser = winner === timeA ? timeB : timeA;
            winner.pontos += 2; loser.pontos += 1;
        } else if (p.placarA > p.placarB) {
            timeA.pontos += 3;
        } else if (p.placarB > p.placarA) {
            timeB.pontos += 3;
        } else {
            timeA.pontos += 1; timeB.pontos += 1;
        }
    });

    const sortTeams = (a, b) => (b.pontos - a.pontos) || ((b.golsPro - b.golsContra) - (a.golsPro - a.golsContra)) || (b.golsPro - a.golsPro);
    const allTeamsWithId = Object.entries(teamsData).map(([id, data]) => ({ ...data, id }));
    const classGrupoA = allTeamsWithId.filter(t => grupos.A.includes(t.id)).sort(sortTeams);
    const classGrupoB = allTeamsWithId.filter(t => grupos.B.includes(t.id)).sort(sortTeams);

    const renderTable = (tbody, teams) => {
        tbody.innerHTML = teams.map((team, index) => {
            const saldoGols = team.golsPro - team.golsContra;
            return `<tr class="border-b border-neutral-700/50"><td class="p-3 font-semibold">${index + 1}</td><td class="p-3"><a href="/time.html?id=${team.id}" class="flex items-center gap-3"><img src="${logoMap[team.id]}" class="w-6 h-6 rounded-full object-cover"><span class="font-semibold">${team.nome}</span></a></td><td class="p-3 text-center font-bold">${team.pontos}</td><td class="p-3 text-center">${team.jogos}</td><td class="p-3 text-center font-semibold">${saldoGols > 0 ? '+' : ''}${saldoGols}</td></tr>`;
        }).join('');
    };
    renderTable(tbodyA, classGrupoA);
    renderTable(tbodyB, classGrupoB);
}

function displayPlayoffs(teamsData) {
    const playInContainer = document.getElementById('play-in-match-container');
    const lowBracketContainer = document.getElementById('low-bracket-container');
    const highBracketContainer = document.getElementById('high-bracket-container');
    const finalContainer = document.getElementById('grand-final-match-container');
    if (!playInContainer || !lowBracketContainer || !highBracketContainer || !finalContainer || !teamsData) return;
    
    const playInMatch = { timeA: 'ast', timeB: 'g29' };
    const repescagemJogos = [ { timeA: 'fdq', timeB: 'maf' }, { timeA: 'cfc', timeB: 'psg' }, { timeA: 'vmt', timeB: 'Perdedor (G29 vs Aster)' } ];
    const oitavasJogos = [ { timeA: 'kwr', timeB: 'mag' }, { timeA: 'rep', timeB: 'amb' }, { timeA: 'futpro', timeB: 'imp' }, { timeA: 'dem', timeB: 'Vencedor (G29 vs Aster)' }, { timeA: 'Classificado (Repescagem)', timeB: 'cmg' }, { timeA: 'tnk', timeB: 'ver' }, { timeA: 'hip', timeB: 'naj' }, { timeA: 'asa', timeB: 'hor' } ];
    const finalMatch = { timeA: 'Vencedor High', timeB: 'Vencedor Low' };

    playInContainer.innerHTML = renderMatchCard(playInMatch, teamsData);
    highBracketContainer.innerHTML = oitavasJogos.map(match => renderMatchCard(match, teamsData)).join('');
    lowBracketContainer.innerHTML = repescagemJogos.map(match => renderMatchCard(match, teamsData)).join('');
    finalContainer.innerHTML = renderMatchCard(finalMatch, teamsData);
}

// --- PONTO DE ENTRADA DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
    const mainContent = document.querySelector('main');
    if(mainContent) mainContent.style.visibility = 'hidden';

    const allData = await getAllData();

    if (allData && allData.times && allData.partidas) {
        // Chama cada função de forma independente e segura
        loadTeamsCarousel(allData.times);
        loadLastResults(allData.partidas, allData.times);
        displayGroupTables(allData.partidas, allData.times);
        displayPlayoffs(allData.times); // Passa apenas os dados dos times
    } else {
        const errorContainer = document.getElementById('championship-section');
        if(errorContainer) errorContainer.innerHTML = '<p class="text-center text-red-500 font-bold">Não foi possível carregar os dados do campeonato. Tente novamente mais tarde.</p>';
    }

    if(mainContent) mainContent.style.visibility = 'visible';

    // Lógica do menu mobile
    const btn = document.querySelector("button.mobile-menu-button");
    const menu = document.querySelector(".mobile-menu");
    if (btn && menu) {
        btn.addEventListener("click", () => menu.classList.toggle("hidden"));
    }
});