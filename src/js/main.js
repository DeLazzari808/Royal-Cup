import '../css/style.css';
import { ref, onValue } from "firebase/database";
import { database } from './firebase-config.js';
import { logoMap } from './team-logos.js';

// FUNÇÕES DE AJUDA
async function getAllData() {
    const dataRef = ref(database);
    return new Promise((resolve) => {
        onValue(dataRef, (snapshot) => {
            snapshot.exists() ? resolve(snapshot.val()) : resolve(null);
        }, { onlyOnce: true });
    });
}

function renderMatchCard(match, teamsData) {
    if (!match || !match.timeA || !match.timeB) return '';
    const teamA = teamsData[match.timeA] || { nome: match.timeA || 'A definir' };
    const teamB = teamsData[match.timeB] || { nome: match.timeB || 'A definir' };
    const logoA = logoMap[match.timeA] || '/img/default-logo.png';
    const logoB = logoMap[match.timeB] || '/img/default-logo.png';
    const scoreA = match.placarA ?? '-';
    const scoreB = match.placarB ?? '-';
    const isWinnerA = scoreA !== '-' && scoreB !== '-' && scoreA > scoreB;
    const isWinnerB = scoreA !== '-' && scoreB !== '-' && scoreB > scoreA;
    return `<div class="bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-700"><div class="flex items-center justify-around p-4 sm:p-6"><a href="/time.html?id=${match.timeA}" class="flex flex-col items-center text-center w-28"><img src="${logoA}" alt="${teamA.nome}" class="w-16 h-16 rounded-full object-cover mb-2"><span class="text-base font-bold text-white truncate w-full">${teamA.nome}</span></a><div class="flex items-center justify-center text-3xl md:text-4xl font-extrabold ${isWinnerA || isWinnerB ? 'text-primary-orange' : 'text-neutral-500'}"><span>${scoreA}</span><span class="mx-3">-</span><span>${scoreB}</span></div><a href="/time.html?id=${match.timeB}" class="flex flex-col items-center text-center w-28"><img src="${logoB}" alt="${teamB.nome}" class="w-16 h-16 rounded-full object-cover mb-2"><span class="text-base font-bold text-white truncate w-full">${teamB.nome}</span></a></div></div>`;
}

// FUNÇÕES DE RENDERIZAÇÃO DE CADA SEÇÃO

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
        seeMoreContainer.innerHTML = `<button id="see-more-btn" class="bg-primary-orange text-white font-bold py-2 px-5 rounded-lg hover:bg-orange-600 transition duration-300">Ver mais resultados</button>`;
        document.getElementById('see-more-btn').addEventListener('click', () => {
            container.innerHTML = finishedMatches.map(p => renderMatchCard(p, teamsData)).join('');
            seeMoreContainer.innerHTML = ''; // Remove o botão depois de clicado
        });
    }
}

function displayChampionshipLayout(matchesData, teamsData) {
    // Renderiza Tabelas de Classificação
    const tbodyA = document.getElementById('standings-body-a');
    const tbodyB = document.getElementById('standings-body-b');
    if (!tbodyA || !tbodyB) return;

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
    renderTable(tbodyA, classGrupoA);
    renderTable(tbodyB, classGrupoB);

    // Renderiza Fase Eliminatória
    const playInContainer = document.getElementById('play-in-match-container');
    const lowBracketContainer = document.getElementById('low-bracket-container');
    const highBracketContainer = document.getElementById('high-bracket-container');
    const finalContainer = document.getElementById('grand-final-match-container');
    if (!playInContainer || !lowBracketContainer || !highBracketContainer || !finalContainer) return;

    const playInMatch = { timeA: 'ast', timeB: 'g29' };
    const repescagemJogos = [ { timeA: 'fdq', timeB: 'maf' }, { timeA: 'cfc', timeB: 'psg' }, { timeA: 'vmt', timeB: 'Perdedor (G29 vs Aster)' } ];
    const oitavasJogos = [ { timeA: 'kwr', timeB: 'mag' }, { timeA: 'rep', timeB: 'amb' }, { timeA: 'futpro', timeB: 'imp' }, { timeA: 'dem', timeB: 'Vencedor (G29 vs Aster)' }, { timeA: 'Classificado (Repescagem)', timeB: 'cmg' }, { timeA: 'tnk', timeB: 'ver' }, { timeA: 'hip', timeB: 'naj' }, { timeA: 'asa', timeB: 'hor' } ];
    const finalMatch = { timeA: 'Vencedor High', timeB: 'Vencedor Low' };

    playInContainer.innerHTML = renderMatchCard(playInMatch, teamsData);
    highBracketContainer.innerHTML = oitavasJogos.map(match => renderMatchCard(match, teamsData)).join('<div class="h-4"></div>');
    lowBracketContainer.innerHTML = repescagemJogos.map(match => renderMatchCard(match, teamsData)).join('<div class="h-4"></div>');
    finalContainer.innerHTML = renderMatchCard(finalMatch, teamsData);
}

// --- PONTO DE ENTRADA DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
    const mainContent = document.querySelector('main');
    if(mainContent) mainContent.style.visibility = 'hidden';
    const allData = await getAllData();
    if (allData && allData.times && allData.partidas) {
        loadTeamsCarousel(allData.times);
        loadLastResults(allData.partidas, allData.times);
        displayChampionshipLayout(allData.partidas, allData.times);
    } else {
        document.body.innerHTML = '<p class="text-center text-red-500 font-bold p-8">Erro: Não foi possível carregar os dados do campeonato.</p>';
    }
    if(mainContent) mainContent.style.visibility = 'visible';
    const btn = document.querySelector("button.mobile-menu-button");
    const menu = document.querySelector(".mobile-menu");
    if (btn && menu) btn.addEventListener("click", () => menu.classList.toggle("hidden"));
});